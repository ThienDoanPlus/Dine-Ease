package com.dineease.chatbot.tools;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.function.Function;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;

import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantStatus;
import com.dineease.repository.ReservationRepository;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.RestaurantTableRepository;
import com.dineease.service.CustomerReservationService;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
public class ChatbotToolsConfig {

    private static final int DEFAULT_DINING_DURATION_HOURS = 2;

    // ==========================================
    // TOOL 1 (RAG): TÌM KIẾM CÓ TRẢ VỀ ID
    // CHUYỂN TẤT CẢ SANG STRING ĐỂ VƯỢT QUA LỖI VALIDATION CỦA GROQ
    // ==========================================
    public record SemanticSearchRequest(
        @JsonPropertyDescription("Câu tìm kiếm cốt lõi về món ăn. Ví dụ: 'sushi', 'quán ăn ngon'") 
        String query,
        
        @JsonPropertyDescription("Tên Quận khách muốn. NẾU KHÁCH KHÔNG NHẮC ĐẾN THÌ TRUYỀN CHUỖI RỖNG ''") 
        String district,
        
        @JsonPropertyDescription("Số sao đánh giá tối thiểu. NẾU KHÁCH KHÔNG NHẮC ĐẾN THÌ TRUYỀN '0'") 
        String minRating
    ) {}

    @Bean
    @Description("Công cụ tìm kiếm nhà hàng, món ăn, thực đơn. Trả về thông tin chi tiết và ID CỦA NHÀ HÀNG.")
    public Function<SemanticSearchRequest, String> semanticSearchTool(VectorStore vectorStore) {
        return request -> {
            String filterExpr = "";

            // Xử lý Min Rating an toàn bằng Java
            try {
                if (request.minRating() != null && !request.minRating().trim().isEmpty()) {
                    double rating = Double.parseDouble(request.minRating());
                    if (rating > 0.0) {
                        filterExpr += "rating >= " + rating;
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ AI truyền sai định dạng rating: " + request.minRating());
            }

            // Xử lý Quận
            if (request.district() != null && !request.district().trim().isEmpty()) {
                if (!filterExpr.isEmpty()) {
                    filterExpr += " AND ";
                }
                filterExpr += "district == '" + request.district() + "'";
            }

            SearchRequest.Builder searchBuilder = SearchRequest.builder()
                    .query(request.query())
                    .topK(5);

            if (!filterExpr.isEmpty()) {
                searchBuilder.filterExpression(filterExpr); 
                System.out.println("🔍 [HYBRID SEARCH] Đã kích hoạt bộ lọc: " + filterExpr);
            }

            List<Document> results = vectorStore.similaritySearch(searchBuilder.build());

            if (results.isEmpty()) return "Hệ thống chưa tìm thấy thông tin nào khớp với yêu cầu tìm kiếm.";

            StringBuilder sb = new StringBuilder("Dữ liệu tra cứu được từ hệ thống:\n");
            for (Document doc : results) {
                Object resId = doc.getMetadata().get("restaurantId");
                Object type = doc.getMetadata().get("type");
                
                sb.append("[ID QUÁN: ").append(resId)
                  .append(" | Loại dữ liệu: ").append(type).append("]\n");
                sb.append(doc.getText()).append("\n---\n");
            }
            return sb.toString();
        };
    }

    // ==========================================
    // TOOL 2: CHECK AVAILABILITY
    // ==========================================
    public record CheckAvailabilityRequest(
        @JsonPropertyDescription("ID của nhà hàng. TRUYỀN '-1' NẾU CHƯA RÕ") String restaurantId,
        @JsonPropertyDescription("Ngày định dạng YYYY-MM-DD") String date,
        @JsonPropertyDescription("Giờ định dạng HH:mm") String time,
        @JsonPropertyDescription("Số lượng khách. TRUYỀN '1' NẾU CHƯA RÕ") String guestCount
    ) {}

    @Bean
    @Description("Dùng để kiểm tra chỗ trống của nhà hàng.")
    public Function<CheckAvailabilityRequest, String> checkAvailabilityTool(
            RestaurantRepository restaurantRepo,
            RestaurantTableRepository tableRepo,
            ReservationRepository reservationRepo) {
        
        return request -> {
            try {
                // Ép kiểu ID bằng Java
                Long resId = -1L;
                try {
                    if (request.restaurantId() != null) resId = Long.parseLong(request.restaurantId());
                } catch (Exception e) {}

                if (resId == -1L) {
                    resId = com.dineease.chatbot.service.ChatbotActionContext.getCurrentRestaurantId();
                    if (resId == null) {
                        return "Hệ thống không rõ bạn muốn đặt ở nhà hàng nào. Vui lòng cho biết tên nhà hàng ạ.";
                    }
                }

                Restaurant restaurant = restaurantRepo.findById(resId).orElse(null);
                if (restaurant == null || restaurant.getStatus() != RestaurantStatus.ACTIVE) {
                    return "Lỗi: Không tìm thấy nhà hàng hoặc nhà hàng đang đóng cửa.";
                }

                Integer totalCapacity = tableRepo.getTotalCapacityByRestaurantId(restaurant.getId());
                if (totalCapacity == null || totalCapacity == 0) return "Nhà hàng này hiện chưa thiết lập sơ đồ bàn.";

                LocalDate resDate = LocalDate.parse(request.date());
                LocalTime resTime = LocalTime.parse(request.time());
                
                LocalTime startBoundary = resTime.minusHours(DEFAULT_DINING_DURATION_HOURS);
                LocalTime endBoundary = resTime.plusHours(DEFAULT_DINING_DURATION_HOURS);
                
                Integer reservedGuests = reservationRepo.getTotalReservedGuestsForTimeRange(
                        restaurant.getId(), resDate, startBoundary, endBoundary);
                if (reservedGuests == null) reservedGuests = 0;
                int availableCapacity = totalCapacity - reservedGuests;

                // Ép kiểu Guest Count an toàn
                int guests = 1;
                try {
                    if (request.guestCount() != null) guests = Integer.parseInt(request.guestCount());
                } catch (Exception e) {}

                if (guests > availableCapacity) {
                    return String.format("Nhà hàng %s vào lúc %s ngày %s chỉ còn trống %d chỗ. Không đủ cho %d khách.", 
                            restaurant.getName(), request.time(), request.date(), availableCapacity, guests);
                } else {
                    return String.format("Nhà hàng %s hiện vẫn còn đủ chỗ cho %d khách vào lúc %s ngày %s. Báo khách xác nhận để giữ chỗ.", 
                            restaurant.getName(), guests, request.time(), request.date());
                }
            } catch (Exception e) {
                return "Lỗi dữ liệu đầu vào. Hãy đảm bảo truyền đúng định dạng ngày YYYY-MM-DD và giờ HH:mm.";
            }
        };
    }

    // ==========================================
    // TOOL 3: PREPARE BOOKING UI
    // ==========================================
    public record PrepareBookingUiRequest(
        @JsonPropertyDescription("ID nhà hàng. TRUYỀN '-1' NẾU CHƯA RÕ") String restaurantId,
        String date, String time, 
        @JsonPropertyDescription("Số khách. TRUYỀN '1' NẾU CHƯA RÕ") String guestCount, 
        @JsonPropertyDescription("Ghi chú. TRUYỀN CHUỖI RỖNG '' NẾU KHÔNG CÓ") String notes
    ) {}

    @Bean
    @Description("Kích hoạt giao diện đặt bàn cho khách xác nhận. Chỉ gọi khi ĐÃ XÁC NHẬN CÒN CHỖ.")
    public Function<PrepareBookingUiRequest, String> prepareBookingUiTool(RestaurantRepository restaurantRepo) {
        return request -> {
            try {
                Long resId = -1L;
                try {
                    if (request.restaurantId() != null) resId = Long.parseLong(request.restaurantId());
                } catch (Exception e) {}

                if (resId == -1L) {
                    resId = com.dineease.chatbot.service.ChatbotActionContext.getCurrentRestaurantId();
                    if (resId == null) return "Vui lòng yêu cầu khách cung cấp tên nhà hàng muốn đặt.";
                }

                Restaurant restaurant = restaurantRepo.findById(resId).orElse(null);
                if (restaurant == null || restaurant.getStatus() != RestaurantStatus.ACTIVE) {
                    return "Lỗi: Không tìm thấy quán.";
                }

                int guests = 1;
                try {
                    if (request.guestCount() != null) guests = Integer.parseInt(request.guestCount());
                } catch (Exception e) {}

                java.util.Map<String, Object> actionPayload = java.util.Map.of(
                    "action", "CONFIRM_BOOKING_UI",
                    "data", java.util.Map.of(
                        "restaurantId", restaurant.getId(),
                        "restaurantName", restaurant.getName(),
                        "date", request.date(),
                        "time", request.time(),
                        "guestCount", guests,
                        "notes", (request.notes() != null) ? request.notes() : ""
                    )
                );

                com.dineease.chatbot.service.ChatbotActionContext.setActionData(actionPayload);
                return "HỆ THỐNG: Đã mở form xác nhận trên màn hình khách.";

            } catch (Exception e) {
                return "Lỗi định dạng hệ thống.";
            }
        };
    }

    // ==========================================
    // TOOL 4: HỦY ĐẶT BÀN
    // ==========================================
    public record CancelReservationToolRequest(
        @JsonPropertyDescription("ID đơn đặt bàn. TRUYỀN DƯỚI DẠNG CHUỖI, VD: '123'") String reservationId, 
        String cancelReason
    ) {}

    @Bean
    @Description("Dùng để hủy một đơn đặt bàn.")
    public Function<CancelReservationToolRequest, String> cancelReservationTool(CustomerReservationService reservationService) {
        return request -> {
            try {
                Long resId = Long.parseLong(request.reservationId());
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                com.dineease.dto.CancelReservationRequest systemRequest = new com.dineease.dto.CancelReservationRequest(request.cancelReason());
                reservationService.cancelReservation(resId, systemRequest, email);
                return "THÀNH CÔNG! Đã hủy đơn đặt bàn mã " + resId;
            } catch (Exception e) {
                return "THẤT BẠI khi hủy bàn. Có thể mã ID không hợp lệ hoặc lỗi hệ thống.";
            }
        };
    }

    // ==========================================
    // TOOL 5: TRA CỨU LỊCH SỬ ĐẶT BÀN
    // ==========================================
    public record GetMyBookingHistoryRequest() {}

    @Bean
    @Description("Dùng để tra cứu lịch sử đặt bàn của khách hàng.")
    public Function<GetMyBookingHistoryRequest, String> getMyBookingHistoryTool(CustomerReservationService reservationService) {
        return request -> {
            try {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                var historyPage = reservationService.getMyReservations(email, org.springframework.data.domain.PageRequest.of(0, 5));

                if (historyPage.isEmpty()) return "Khách hàng chưa có lịch sử đặt bàn nào trên hệ thống.";

                StringBuilder sb = new StringBuilder("Danh sách đơn đặt bàn gần đây:\n");
                for (com.dineease.dto.ReservationResponse res : historyPage.getContent()) {
                    sb.append(String.format("- Mã đơn: %d | Quán: %s | Lúc: %s ngày %s | Số khách: %d | Trạng thái: %s\n",
                            res.id(), res.restaurantName(), res.reservationTime(), res.reservationDate(), res.guestCount(), res.status()));
                }
                return sb.toString();
            } catch (Exception e) {
                return "Lỗi khi lấy lịch sử đặt bàn.";
            }
        };
    }
}
