package com.dineease.chatbot.service;

import java.util.Map;

/**
 * Class này đóng vai trò như một "Khoang chứa bí mật" giữa Tool và Controller.
 * Giúp Tool truyền thẳng Data (JSON) ra Controller mà không cần đi xuyên qua bộ não của AI.
 */
public class ChatbotActionContext {
    private static final ThreadLocal<Map<String, Object>> ACTION_DATA = new ThreadLocal<>();
    
    // THÊM: Biến lưu ID nhà hàng mà Frontend đang xem
    private static final ThreadLocal<Long> CURRENT_RESTAURANT_ID = new ThreadLocal<>();

    public static void setActionData(Map<String, Object> data) {
        ACTION_DATA.set(data);
    }

    public static Map<String, Object> getActionData() {
        return ACTION_DATA.get();
    }

    public static void setCurrentRestaurantId(Long id) {
        CURRENT_RESTAURANT_ID.set(id);
    }

    public static Long getCurrentRestaurantId() {
        return CURRENT_RESTAURANT_ID.get();
    }

    public static void clear() {
        ACTION_DATA.remove();
        CURRENT_RESTAURANT_ID.remove();
    }
}
