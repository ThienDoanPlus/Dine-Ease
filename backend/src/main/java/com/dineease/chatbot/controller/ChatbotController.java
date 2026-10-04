package com.dineease.chatbot.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dineease.chatbot.dto.ChatbotResponse;
import com.dineease.chatbot.service.ChatbotActionContext;
import com.dineease.chatbot.service.ChatbotOrchestrator;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Chatbot AI", description = "API giao tiếp với trợ lý ảo Dine-Ease AI")
@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {

    private static final Logger log = LoggerFactory.getLogger(ChatbotController.class);

    private final ChatbotOrchestrator chatbotOrchestrator;
    private final ChatMemory chatMemory;

    public ChatbotController(ChatbotOrchestrator chatbotOrchestrator, ChatMemory chatMemory) {
        this.chatbotOrchestrator = chatbotOrchestrator;
        this.chatMemory = chatMemory;
    }

    @Operation(summary = "Trò chuyện với AI", description = "Gửi tin nhắn và nhận phản hồi từ trợ lý ảo")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/chat")
    public ResponseEntity<ChatbotResponse> chat(
            Authentication auth,
            @RequestParam String message,
            @RequestParam(required = false) Long currentRestaurantId) {

        String userEmail = auth.getName();
        log.info("📩 [CHAT] User: {} | Message: {} | CurrentRes: {}", userEmail, message, currentRestaurantId);

        try {
            // Lưu vết quán ăn hiện tại khách đang xem vào Context (nếu có)
            if (currentRestaurantId != null) {
                ChatbotActionContext.setCurrentRestaurantId(currentRestaurantId);
            }

            // Gọi Orchestrator xử lý nghiệp vụ
            String aiResponse = chatbotOrchestrator.chat(userEmail, message, currentRestaurantId);
            
            // Lấy dữ liệu hành động UI (nếu Tool có yêu cầu)
            Map<String, Object> actionData = ChatbotActionContext.getActionData();

            // Trả về Response
            if (actionData != null) {
                log.info("⚡ [ACTION INTERCEPTED] Loại hành động: {}", actionData.get("action"));
                return ResponseEntity.ok(new ChatbotResponse("ACTION", aiResponse, actionData));
            }

            return ResponseEntity.ok(new ChatbotResponse("TEXT", aiResponse, null));

        } catch (Exception e) {
            log.error("❌ Lỗi xử lý chatbot: ", e);
            return ResponseEntity.status(500)
                    .body(new ChatbotResponse("TEXT", "Dạ xin lỗi bạn, hệ thống đang gặp chút gián đoạn. Bạn thử lại sau nhé!", null));
        } finally {
            // [VÁ LỖ HỔNG MEMORY LEAK]: LUÔN LUÔN DỌN RÁC THREAD DÙ CÓ LỖI HAY KHÔNG
            ChatbotActionContext.clear();
        }

    }

    @Operation(summary = "Xóa lịch sử trò chuyện (Ngữ cảnh AI)", description = "Xóa context của user hiện tại khỏi RAM")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/memory")
    public ResponseEntity<Void> clearChatMemory(Authentication auth) {
        String userEmail = auth.getName();
        
        // Gọi hàm clear mặc định của Spring AI dựa theo ConversationId (ở đây là email)
        chatMemory.clear(userEmail); 
        
        log.info("🧹 [CHAT MEMORY] Đã dọn dẹp ngữ cảnh AI cho user: {}", userEmail);
        return ResponseEntity.ok().build();
    }
}