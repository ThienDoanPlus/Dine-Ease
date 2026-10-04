package com.dineease.service;

import java.time.LocalTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dineease.dto.CancelReservationRequest;
import com.dineease.dto.ReservationRequest;
import com.dineease.dto.ReservationResponse;
import com.dineease.entity.CustomerProfile;
import com.dineease.entity.Reservation;
import com.dineease.entity.ReservationStatus;
import com.dineease.entity.Restaurant;
import com.dineease.entity.User;
import com.dineease.exception.DuplicateResourceException;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.CustomerProfileRepository;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.RestaurantTableRepository;
import com.dineease.repository.UserRepository;

@Service
public class CustomerReservationService {
    private final ReservationRepository reservationRepository;
    private final RestaurantRepository restaurantRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final UserRepository userRepository;
    private final RestaurantTableRepository tableRepository;

    // --- CODE CỦA YẾN: Mặc định 2 tiếng ---
    private static final int DEFAULT_DINING_DURATION_HOURS = 2;

    public CustomerReservationService(ReservationRepository reservationRepository, RestaurantRepository restaurantRepository, CustomerProfileRepository customerProfileRepository, UserRepository userRepository, RestaurantTableRepository tableRepository) {
        this.reservationRepository = reservationRepository;
        this.restaurantRepository = restaurantRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.userRepository = userRepository;
        this.tableRepository = tableRepository;
    }

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request, String customerEmail) {
        // [VÁ LỖ HỔNG DATA RACE]: Sử dụng Pessimistic Lock để xếp hàng các request đến cùng 1 nhà hàng
        Restaurant restaurant = restaurantRepository.findByIdWithPessimisticLock(request.restaurantId())
            .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", request.restaurantId()));

        // ==========================================================
        // [VÁ LỖ HỔNG MAX PAX]: KIỂM TRA SỐ LƯỢNG KHÁCH TRÊN 1 ĐƠN
        // ==========================================================
        if (request.guestCount() > restaurant.getMaxPax()) {
            throw new com.dineease.exception.BadRequestException(
                "Nhà hàng chỉ nhận tối đa " + restaurant.getMaxPax() + " khách trên 1 đơn đặt bàn."
            );
        }

        Integer totalCapacity = tableRepository.getTotalCapacityByRestaurantId(restaurant.getId());
        if (totalCapacity == 0 || totalCapacity == null) {
            throw new IllegalStateException("Nhà hàng hiện chưa thiết lập sơ đồ bàn, không thể nhận khách!");
        }

        // --- CODE CỦA YẾN: Check khoảng thời gian ---
        LocalTime requestedTime = request.reservationTime();
        LocalTime startBoundary = requestedTime.minusHours(DEFAULT_DINING_DURATION_HOURS);
        LocalTime endBoundary = requestedTime.plusHours(DEFAULT_DINING_DURATION_HOURS);
        
        Integer reservedGuests = reservationRepository.getTotalReservedGuestsForTimeRange(
            restaurant.getId(),
            request.reservationDate(),
            startBoundary,
            endBoundary
        );

        if (reservedGuests == null) reservedGuests = 0; 
        Integer availableCapacity = totalCapacity - reservedGuests;

        if(request.guestCount() > availableCapacity) {
            throw new DuplicateResourceException("Rất tiếc! Trong lúc bạn thao tác, đã có khách hàng khác nhanh tay đặt chỗ trước nên nhà hàng chỉ còn trống " + availableCapacity + " chỗ. Vui lòng chọn giờ khác nhé!");
        }

        // --- GIỮ NGUYÊN CODE CỦA BẠN: Customer Profile ---
        CustomerProfile profile = customerProfileRepository.findByUserEmail(customerEmail).orElseGet(() -> {
            User user = userRepository.findByEmail(customerEmail).orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
            CustomerProfile newProfile = CustomerProfile.builder().user(user).build();
            return customerProfileRepository.save(newProfile);
        });

        Reservation reservation = Reservation.builder()
            .customer(profile)
            .restaurant(restaurant)
            .reservationDate(request.reservationDate())
            .reservationTime(request.reservationTime())
            .guestCount(request.guestCount())
            .notes(request.notes())
            .depositAmount(restaurant.getDepositAmount()) // Lấy mức cọc của quán
            // LUỒNG MỚI: 
            // Nếu cần duyệt (khách > 4 hoặc có ghi chú) -> PENDING (Chờ nhà hàng bấm nút)
            // Nếu đơn giản -> AWAITING_DEPOSIT (Cho phép thanh toán ngay)
            .status((request.guestCount() > 4 || (request.notes() != null && !request.notes().trim().isEmpty())) 
                ? ReservationStatus.PENDING 
                : ReservationStatus.AWAITING_DEPOSIT) 
            .build();
            
        reservation = reservationRepository.save(reservation);
        return mapToResponse(reservation);
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getMyReservations(String customerEmail, Pageable pageable) {
        CustomerProfile profile = customerProfileRepository.findByUserEmail(customerEmail)
            .orElseThrow(() -> new ResourceNotFoundException("CustomerProfile không tồn tại cho email: " + customerEmail));
        Page<Reservation> reservations = reservationRepository.findByCustomer(profile, pageable);
        return reservations.map(this::mapToResponse);
    }

    @Transactional
    public ReservationResponse cancelReservation(Long id, CancelReservationRequest request, String customerEmail) {
        Reservation reservation = reservationRepository.findByIdAndCustomerEmail(id, customerEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt bàn không tồn tại hoặc bạn không có quyền hủy đơn này"));
        
        if (reservation.getStatus() == ReservationStatus.CHECKED_IN || 
            reservation.getStatus() == ReservationStatus.COMPLETE || 
            reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Không thể hủy! Đơn đặt bàn này đã hoàn thành, bị hủy hoặc bạn đã tới quán.");
        }
        reservation.setCancelReason(request.cancelReason());
        reservation.setStatus(ReservationStatus.CANCELLED);

        return mapToResponse(reservationRepository.save(reservation));
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        return new ReservationResponse(
            reservation.getId(),
            reservation.getRestaurant().getId(),
            reservation.getRestaurant().getName(),
            reservation.getReservationDate(),
            reservation.getReservationTime(),
            reservation.getGuestCount(),
            reservation.getNotes(),
            reservation.getCancelReason(), 
            reservation.getDepositAmount(),
            reservation.getStatus(),
            
            // Nếu biến review trong Entity != null nghĩa là đã đánh giá
            reservation.getReview() != null 
        );
    }

}
