package com.dineease.controller;

import com.dineease.dto.ReviewRequest;
import com.dineease.dto.ReviewResponse;
import com.dineease.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Review System", description = "Quản lý đánh giá từ khách hàng")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;

    // ==========================================
    // KHÁCH HÀNG VIẾT REVIEW (BẮT BUỘC CÓ TOKEN)
    // ==========================================
    @Operation(summary = "Gửi đánh giá dịch vụ", description = "Khách hàng gửi đánh giá cho đơn đặt bàn trạng thái COMPLETE")
    @SecurityRequirement(name = "bearerAuth") // Yêu cầu Token
    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> submitReview(
        @Valid @RequestBody ReviewRequest request,
        Authentication auth
    ) {
        return ResponseEntity.ok(reviewService.submitReview(request, auth.getName()));
    }

    // ==========================================
    // XEM REVIEW PUBLIC (KHÔNG CẦN TOKEN)
    // ==========================================
    @Operation(summary = "Xem đánh giá của nhà hàng", description = "API công khai lấy danh sách review của một quán")
    // KHÔNG CÓ @SecurityRequirement Ở ĐÂY
    @GetMapping("/public/restaurants/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getRestaurantReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getRestaurantReviews(id));
    }
}
