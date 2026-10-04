package com.dineease.service;

import com.dineease.dto.ReviewRequest;
import com.dineease.dto.ReviewResponse;
import com.dineease.entity.Reservation;
import com.dineease.entity.ReservationStatus;
import com.dineease.entity.Review;
import com.dineease.entity.Restaurant;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.ReviewRepository;
import com.dineease.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public ReviewResponse submitReview(ReviewRequest request, String customerEmail) {
        Reservation reservation = reservationRepository.findById(request.reservationId())
            .orElseThrow(() -> new ResourceNotFoundException("Đơn đặt bàn", request.reservationId()));

        if (!reservation.getCustomer().getUser().getEmail().equals(customerEmail)) {
            throw new IllegalStateException("Bạn không có quyền đánh giá đơn đặt bàn này!");
        }

        if (reservation.getStatus() != ReservationStatus.COMPLETE) {
            throw new IllegalStateException("Bạn chỉ có thể đánh giá sau khi đã hoàn thành bữa ăn!");
        }

        if (reviewRepository.existsByReservationId(request.reservationId())) {
            throw new IllegalStateException("Đơn đặt bàn này đã được đánh giá trước đó.");
        }

        Review review = Review.builder()
            .reservation(reservation)
            .rating(request.rating())
            .comment(request.comment())
            .build();

        review = reviewRepository.save(review);

        // ==========================================================
        // [VÁ LỖ HỔNG RATING]: TÍNH LẠI ĐIỂM TRUNG BÌNH CỦA NHÀ HÀNG
        // ==========================================================
        Restaurant restaurant = reservation.getRestaurant();
        Double newAvg = reviewRepository.getAverageRatingByRestaurantId(restaurant.getId());
        
        if (newAvg != null) {
            // Làm tròn 1 chữ số thập phân (VD: 4.56 -> 4.6)
            restaurant.setAvgRating(Math.round(newAvg * 10.0) / 10.0);
            restaurantRepository.save(restaurant);
        }

        return mapToResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getRestaurantReviews(Long restaurantId) {
        return reviewRepository.findByReservationRestaurantIdOrderByCreatedAtDesc(restaurantId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review review) {
        return new ReviewResponse(
            review.getId(),
            review.getReservation().getCustomer().getUser().getFullName(),
            review.getReservation().getCustomer().getUser().getAvatarUrl(),
            review.getRating(),
            review.getComment(),
            review.getReplyFromRestaurant(),
            review.getCreatedAt()
        );
    }
}
