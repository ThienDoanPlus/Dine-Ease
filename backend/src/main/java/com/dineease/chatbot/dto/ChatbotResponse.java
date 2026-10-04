package com.dineease.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatbotResponse(
    String type,        // "TEXT" (Trò chuyện bình thường) hoặc "ACTION" (Mở UI)
    String content,     // Nội dung tin nhắn nếu type = "TEXT"
    Object actionData   // Dữ liệu mở Modal UI nếu type = "ACTION"
) {}
