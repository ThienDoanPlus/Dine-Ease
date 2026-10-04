package com.dineease.chatbot.rag;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dineease.entity.Restaurant;
import com.dineease.repository.RestaurantRepository;

/**
 * Service to sync database entities to Vector Store for RAG capabilities.
 */
@Service
public class RagSyncService {

    private static final Logger log = LoggerFactory.getLogger(RagSyncService.class);

    private final RestaurantRepository restaurantRepository;
    private final VectorStore vectorStore;

    public RagSyncService(RestaurantRepository restaurantRepository, VectorStore vectorStore) {
        this.restaurantRepository = restaurantRepository;
        this.vectorStore = vectorStore;
    }

    // Sự kiện này tự chạy khi Spring Boot start thành công
    @Transactional(readOnly = true)
    @EventListener(ApplicationReadyEvent.class)
    public void syncDatabaseToVectorStore() {
        log.info("🚀 Bắt đầu nhúng (Embedding) dữ liệu Nhà hàng vào Vector Store với kiến trúc Advanced RAG...");
        
        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<Document> documents = new ArrayList<>();

        for (Restaurant r : restaurants) {
            if (!"ACTIVE".equals(r.getStatus().name())) continue; // Chỉ lấy quán đang mở

            // ====================================================
            // CHUNK 1: THÔNG TIN TỔNG QUAN CỦA QUÁN (RESTAURANT_INFO)
            // ====================================================
            // 1. Tách thông tin Quận và Rating để làm MetaData
            String district = extractDistrict(r.getAddress());
            Double rating = r.getAvgRating() != null ? r.getAvgRating() : 0.0;

            String infoContent = String.format("""
                Thông tin Nhà hàng: %s
                Địa chỉ: %s
                Đánh giá: %s sao
                Mô tả không gian và phong cách: %s
                """, 
                r.getName(), r.getAddress(), r.getAvgRating(), r.getDescription());

            Document infoDoc = new Document(infoContent, Map.of(
                "restaurantId", r.getId(),
                "restaurantName", r.getName(),
                "type", "RESTAURANT_INFO",
                "rating", rating,
                "district", district
            ));
            documents.add(infoDoc);

            // ====================================================
            // CHUNK 2 -> N: MENU THEO TỪNG DANH MỤC (MENU_CATEGORY)
            // ====================================================
            // Nhóm các món ăn đang bán theo Danh mục (VD: Khai vị, Tráng miệng)
            Map<String, List<com.dineease.entity.MenuItem>> groupedMenu = r.getMenuItems().stream()
                    .filter(m -> m.getStatus() == com.dineease.entity.MenuItemStatus.AVAILABLE)
                    .collect(Collectors.groupingBy(m -> m.getCategory().getName()));

            // Tạo Document riêng cho từng Danh mục
            for (Map.Entry<String, List<com.dineease.entity.MenuItem>> entry : groupedMenu.entrySet()) {
                String categoryName = entry.getKey();
                
                // Gom các món trong danh mục này thành chuỗi
                String itemsList = entry.getValue().stream()
                        .map(m -> String.format("- %s (Giá: %s VND): %s", 
                                m.getName(), m.getPrice(), m.getDescription() != null ? m.getDescription() : ""))
                        .collect(Collectors.joining("\n"));

                String menuContent = String.format("""
                    Thực đơn nhóm '%s' của nhà hàng '%s':
                    %s
                    """, categoryName, r.getName(), itemsList);

                Document menuDoc = new Document(menuContent, Map.of(
                    "restaurantId", r.getId(),
                    "restaurantName", r.getName(),
                    "categoryName", categoryName,
                    "type", "MENU_CATEGORY",
                    "rating", rating,
                    "district", district
                ));
                documents.add(menuDoc);
            }
        }

        // Đẩy toàn bộ các Chunk vào RAM (Vector DB)
        if (!documents.isEmpty()) {
            try {
                vectorStore.add(documents);
                log.info("✅ Đã đưa {} mảnh dữ liệu (Chunks) vào Vector Database (Advanced RAG Ready!).", documents.size());
            } catch (Exception e) {
                log.error("❌ LỖI RAG: Không thể đồng bộ Vector Store (có thể do API Key hết tiền hoặc lỗi kết nối): {}", e.getMessage());
            }
        }
    }

    // Thêm một hàm helper nhỏ ở dưới cùng class để bóc tách Quận từ Địa chỉ
    private String extractDistrict(String address) {
        if (address == null) return "Khác";
        // Tìm chữ "Quận X" hoặc "Q.X"
        Matcher matcher = Pattern.compile("(Quận\\s*\\w+|Q\\.\\s*\\w+)").matcher(address);
        if (matcher.find()) return matcher.group(1).replace("Q.", "Quận ");
        return "Khác";
    }
}
