package com.dineease.service;

import java.math.BigDecimal;
import com.dineease.dto.ManageReservationResponse;
import com.dineease.dto.UpdateManageReservationStatusRequest;
import com.dineease.entity.CustomerProfile;
import com.dineease.entity.Reservation;
import com.dineease.entity.ReservationStatus;
import com.dineease.entity.RestaurantTable;
import com.dineease.entity.TableStatus;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantTableRepository;
import com.dineease.repository.CustomerProfileRepository;
import com.dineease.dto.KanbanBoardResponse;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ManageReservationService {
    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final com.dineease.repository.OrderRepository orderRepository;
    private final com.dineease.repository.PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public Page<ManageReservationResponse> getMyReservations(String email, Pageable pageable) {
        return reservationRepository.findByRestaurantOwnerEmail(email, pageable).map(this::mapToResponse);
    }

    @Transactional
    public ManageReservationResponse updateReservationStatus(Long id, UpdateManageReservationStatusRequest request, String email) {
        Reservation reservation = reservationRepository.findByIdAndRestaurantOwnerEmail(id, email)
            .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt bàn không tồn tại hoặc không thuộc quyền quản lý"));
            
        ReservationStatus newStatus = request.status();

        // [CỦA KHOA]: Chặn Data Race Lỗi "Ma" Kanban
        if (reservation.getStatus() == ReservationStatus.CANCELLED && newStatus != ReservationStatus.CANCELLED) {
            throw new com.dineease.exception.DuplicateResourceException("Thao tác thất bại: Đơn này vừa được khách hàng hủy trên ứng dụng!");
        }

        // 1. Duyệt đơn
        if (newStatus == ReservationStatus.CONFIRMED) {
            if (reservation.getStatus() != ReservationStatus.PENDING && reservation.getStatus() != ReservationStatus.AWAITING_DEPOSIT) {
                throw new IllegalStateException("Chỉ có thể xác nhận đơn đang ở trạng thái Chờ xử lý.");
            }
            
            // Nếu nhà hàng yêu cầu tiền cọc > 0
            if (reservation.getRestaurant().getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
                reservation.setStatus(ReservationStatus.AWAITING_DEPOSIT);
                // Gửi email/thông báo: "Nhà hàng đã duyệt yêu cầu, vui lòng thanh toán cọc trong 30p"
            } else {
                // Nếu quán không thu tiền cọc (0đ)
                reservation.setStatus(ReservationStatus.CONFIRMED);
            }
        }
        // 2. Check-in
        else if (newStatus == ReservationStatus.CHECKED_IN) {
            if (reservation.getStatus() != ReservationStatus.CONFIRMED && reservation.getStatus() != ReservationStatus.PENDING) {
                throw new IllegalStateException("Đơn hàng phải ở trạng thái Đã xác nhận hoặc Chờ xử lý mới có thể Check-in");
            }

            java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
            if (!reservation.getReservationDate().equals(today)) {
                throw new IllegalStateException("Không thể Xếp bàn (Check-in) cho đơn của ngày khác. Vui lòng chỉ bấm Xác nhận và đợi đến ngày khách đến!");
            }

            if (request.tableId() == null) throw new IllegalArgumentException("Vui lòng chọn bàn");
            
            RestaurantTable requestedTable = tableRepository.findById(request.tableId())
                .orElseThrow(() -> new ResourceNotFoundException("Bàn không tồn tại"));
                
            Long masterId = requestedTable.getMergedId() != null 
                            ? requestedTable.getMergedId() 
                            : requestedTable.getId();
            
            RestaurantTable masterTable = tableRepository.findById(masterId)
                .orElseThrow(() -> new ResourceNotFoundException("Bàn Master không tồn tại"));

            if (!masterTable.getRestaurant().getOwner().getEmail().equals(email)) {
                throw new AccessDeniedException("Lỗi bảo mật: Bàn không thuộc quán của bạn!");
            }

            if (masterTable.getStatus() != TableStatus.AVAILABLE) {
                throw new IllegalStateException("Không thể xếp chỗ! Bàn cha hoặc cụm bàn này đang bận.");
            }
            
            reservation.setAssignedTable(masterTable);
            reservation.setStatus(ReservationStatus.CHECKED_IN);
            tableRepository.updateStatusForTableGroup(masterId, TableStatus.OCCUPIED);
        }
        // 3. HOÀN THÀNH: Hệ thống tự động xử lý qua POS, không cho phép nhập tay
        else if (newStatus == ReservationStatus.COMPLETE) {
            throw new IllegalStateException(
                "Hệ thống từ chối thao tác thủ công. Trạng thái 'Hoàn thành' chỉ được xác lập " +
                "tự động sau khi hóa đơn tại bàn được thanh toán hoàn tất ở màn hình POS."
            );
        }
        // 4. Khách Hủy bàn
        else if (newStatus == ReservationStatus.CANCELLED) {
            if (reservation.getAssignedTable() != null) {
                RestaurantTable table = reservation.getAssignedTable();
                Long masterTableId = table.getMergedId() != null ? table.getMergedId() : table.getId();
                
                boolean hasActivePOSOrder = orderRepository.existsByTableIdAndStatus(masterTableId, com.dineease.entity.OrderStatus.OPEN);
                
                if (hasActivePOSOrder) {
                    throw new com.dineease.exception.DuplicateResourceException(
                        "Không thể hủy bàn: Khách tại bàn này đã gọi món và đang có hóa đơn tại quầy POS. Vui lòng xử lý hoặc hủy hóa đơn POS trước!"
                    );
                }
                
                tableRepository.updateStatusForTableGroup(masterTableId, TableStatus.AVAILABLE); 
            }
            reservation.setStatus(ReservationStatus.CANCELLED);
        }

        return mapToResponse(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public KanbanBoardResponse getKanbanBoardData(String email, String keyword, java.time.LocalDate targetDate) {
        List<Reservation> reservations = reservationRepository.findReservationsForKanban(email, keyword, targetDate);

        List<ManageReservationResponse> pending = new ArrayList<>();
        List<ManageReservationResponse> confirmed = new ArrayList<>();
        List<ManageReservationResponse> finalCol = new ArrayList<>();

        for (Reservation res : reservations) {
            ManageReservationResponse dto = mapToResponse(res);
            
            switch (res.getStatus()) {
                case PENDING:
                case AWAITING_DEPOSIT:
                    pending.add(dto);
                    break;
                case CONFIRMED:
                case CHECKED_IN:
                    confirmed.add(dto);
                    break;
                case COMPLETE:
                case CANCELLED:
                    finalCol.add(dto);
                    break;
            }
        }

        return new KanbanBoardResponse(pending, confirmed, finalCol);
    }

    private ManageReservationResponse mapToResponse(Reservation res) {
        String customerName = "Khách vãng lai";
        if (res.getCustomer() != null && res.getCustomer().getUser() != null) {
            customerName = res.getCustomer().getUser().getFullName();
        } else if (res.getWalkInCustomerName() != null && !res.getWalkInCustomerName().isBlank()) {
            customerName = res.getWalkInCustomerName();
        }

        String customerPhone = "N/A";
        if (res.getCustomer() != null && res.getCustomer().getUser() != null) {
            customerPhone = res.getCustomer().getUser().getPhone();
        } else if (res.getWalkInCustomerPhone() != null && !res.getWalkInCustomerPhone().isBlank()) {
            customerPhone = res.getWalkInCustomerPhone();
        }
            
        String customerAvatar = res.getCustomer() != null && res.getCustomer().getUser() != null
            ? res.getCustomer().getUser().getAvatarUrl() : null;
            
        String tableName = res.getAssignedTable() != null ? res.getAssignedTable().getTableName() : null;

        return new ManageReservationResponse(
                res.getId(), customerName, customerPhone, customerAvatar,
                res.getReservationDate(), res.getReservationTime(),
                res.getGuestCount(), res.getNotes(), res.getCancelReason(),
                res.getStatus(), tableName
        );
    }
}