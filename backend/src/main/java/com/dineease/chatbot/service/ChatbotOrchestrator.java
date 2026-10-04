package com.dineease.chatbot.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.Locale;
import java.util.Map;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

import com.dineease.entity.CustomerProfile;
import com.dineease.entity.Restaurant;
import com.dineease.entity.User;
import com.dineease.repository.CustomerProfileRepository;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.UserRepository;

@Service
public class ChatbotOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(ChatbotOrchestrator.class);

    private final ChatClient chatClient;
    private final UserRepository userRepository;
    private final CustomerProfileRepository profileRepository;
    private final RestaurantRepository restaurantRepository;

    private final SemanticRouter semanticRouter;
    private final SemanticCacheService semanticCacheService;

    public ChatbotOrchestrator(ChatClient chatClient, UserRepository userRepository,
            CustomerProfileRepository profileRepository, RestaurantRepository restaurantRepository,
            SemanticRouter semanticRouter, SemanticCacheService semanticCacheService) {
        this.chatClient = chatClient;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.restaurantRepository = restaurantRepository;
        this.semanticRouter = semanticRouter;
        this.semanticCacheService = semanticCacheService;
    }

    public String chat(String email, String userMessage, Long currentRestaurantId) {

        User user = userRepository.findByEmail(email).orElseThrow();
        CustomerProfile profile = profileRepository.findByUserEmail(email).orElse(null);

        LocalDateTime now = LocalDateTime.now();
        String currentDateTime = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        String currentDayOfWeek = now.format(DateTimeFormatter.ofPattern("EEEE", Locale.of("vi", "VN")));

        String loyaltyInfo = (profile != null) ? profile.getLoyaltyPoints() + " điểm" : "0 điểm";

        // Prompt Gốc: Cung cấp thân phận và môi trường
        String dynamicSystemPrompt = String.format(
                """
                # ROLE
                Bạn là Dine-Ease Assistant, lễ tân ảo cao cấp của nền tảng đặt bàn nhà hàng.
                Phong cách: Chuyên nghiệp, thân thiện, súc tích (trả lời ngắn gọn, không dài dòng).

                # SYS-ENV
                - Hiện tại: %s, Ngày %s
                - Khách hàng: %s
                - Điểm thành viên: %s
                """,
                currentDayOfWeek, currentDateTime, user.getFullName(), loyaltyInfo);

        ChatIntent intent = semanticRouter.predictIntent(userMessage);
        log.info("🎯 [ROUTER] Người dùng: '{}' -> Ý định dự đoán: {}", email, intent.name());

        // ==========================================
        // 🛡️ BƯỚC ĐÁNH CHẶN SEMANTIC CACHE
        // ==========================================
        if (intent == ChatIntent.GENERAL || intent == ChatIntent.DISCOVERY) {
            String cachedResponse = semanticCacheService.checkCache(userMessage);
            if (cachedResponse != null) {
                return cachedResponse;
            }
        }

        String aiResponse = switch (intent) {
            case DISCOVERY -> runDiscoveryAgent(email, userMessage, dynamicSystemPrompt);
            case TRANSACTION -> runTransactionAgent(email, userMessage, dynamicSystemPrompt);
            case GENERAL -> runGeneralAgent(email, userMessage, dynamicSystemPrompt);
        };

        // ==========================================
        // LƯU KẾT QUẢ VÀO CACHE ĐỂ DÙNG CHO LẦN SAU
        // ==========================================
        if (intent == ChatIntent.GENERAL || intent == ChatIntent.DISCOVERY) {
            semanticCacheService.saveToCache(userMessage, aiResponse);
            log.info("💾 Đã lưu câu trả lời vào Semantic Cache.");
        }

        return aiResponse;
    }


    private String runDiscoveryAgent(String email, String userMessage, String systemPrompt) {
        String specificPrompt = systemPrompt + """
                
                # TASK: DISCOVERY (TÌM KIẾM & TƯ VẤN)
                Bạn có nhiệm vụ tư vấn nhà hàng, món ăn dựa trên yêu cầu của khách.

                # WORKFLOW & RULES (TUYỆT ĐỐI TUÂN THỦ):
                1. Phân tích từ khoá từ câu hỏi của khách và GỌI 'semanticSearchTool' để tra cứu dữ liệu.
                2. Dựa vào kết quả, giới thiệu cho khách từ 1 đến 3 lựa chọn tốt nhất. NẾU KHÔNG CÓ KẾT QUẢ, thành thật xin lỗi, KHÔNG TỰ BỊA DATA.
                3. BẠN KHÔNG CÓ CÔNG CỤ ĐẶT BÀN Ở LUỒNG NÀY. 
                4. NẾU khách hàng nói các câu mang ý nghĩa đồng ý đặt bàn (Ví dụ: "Ok đặt cho mình", "Chốt nhé", "Ghi chú là..."), TUYỆT ĐỐI KHÔNG ĐƯỢC BẢO LÀ "ĐÃ ĐẶT THÀNH CÔNG".
                5. Thay vào đó, hãy đáp lại nguyên văn câu sau để hệ thống chuyển luồng: 
                   "Dạ để hệ thống tạo đơn đặt bàn, phiền bạn nhắc lại giúp mình: Tên quán, Thời gian và Số lượng khách kèm ghi chú nhé ạ!"
                """;

        return chatClient.prompt()
                .system(specificPrompt)
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, email))
                .toolNames("semanticSearchTool")
                .call()
                .content();
    }

    private String runTransactionAgent(String email, String userMessage, String systemPrompt) {
        String specificPrompt = systemPrompt + """
                
                # TASK: TRANSACTION (ĐẶT BÀN & QUẢN LÝ ĐƠN)
                Bạn có nhiệm vụ thu thập thông tin để hỗ trợ khách đặt chỗ hoặc huỷ bàn.

                # WORKFLOW (Thực hiện tuần tự):
                1. Xác định các thông tin: [Tên Quán], [Ngày], [Giờ], [Số lượng khách]. Nếu thiếu, hãy hỏi lại.
                2. NẾU khách chưa nhắc đến tên quán, hãy truyền -1 vào tham số 'restaurantId' khi gọi tool. Hệ thống sẽ tự biết khách đang xem quán nào.
                3. GỌI 'checkAvailabilityTool' để kiểm tra chỗ trống trước khi chốt đơn.
                4. NẾU hệ thống báo còn đủ chỗ VÀ khách hàng XÁC NHẬN ĐỒNG Ý ĐẶT BÀN (Hoặc nói "Ok", "Chốt", "Kèm ghi chú"), BẠN BẮT BUỘC PHẢI GỌI 'prepareBookingUiTool' ĐỂ MỞ FORM XÁC NHẬN.
                5. Tóm tắt lại thông tin cực kỳ ngắn gọn và báo khách bấm xác nhận trên màn hình. TUYỆT ĐỐI KHÔNG BẢO LÀ "ĐÃ ĐẶT THÀNH CÔNG" khi khách chưa bấm nút trên Form.
                """;

        return chatClient.prompt()
                .system(specificPrompt)
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, email))
                .toolNames("checkAvailabilityTool", "prepareBookingUiTool", "cancelReservationTool", "getMyBookingHistoryTool")
                .call()
                .content();
    }

    private String runGeneralAgent(String email, String userMessage, String systemPrompt) {
        String specificPrompt = systemPrompt + """
                
                # TASK: GENERAL (TRÒ CHUYỆN & ĐIỀU HƯỚNG)
                Nhiệm vụ: Chào hỏi và hỗ trợ khách hàng các vấn đề ngoài lề.

                # RULES:
                1. Nếu khách chào hỏi, hãy chào lại thân thiện.
                2. Nếu khách hỏi về việc tìm quán, review, hoặc đặt bàn, hãy hướng dẫn khách đặt câu hỏi cụ thể hơn (Ví dụ: "Bạn muốn tìm quán khu vực nào?").
                3. Tuyệt đối không tự bịa thông tin nhà hàng.
                """;

        return chatClient.prompt()
                .system(specificPrompt)
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, email))
                .call()
                .content();
    }
}