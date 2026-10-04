package com.dineease.service;

import com.dineease.entity.MenuItem;
import com.dineease.entity.Restaurant;
import com.dineease.repository.MenuItemRepository;
import com.dineease.repository.OrderItemRepository;
import com.dineease.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class MenuBestsellerScheduler {

    private static final Logger log = LoggerFactory.getLogger(MenuBestsellerScheduler.class);
    private final RestaurantRepository restaurantRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;

    public MenuBestsellerScheduler(RestaurantRepository restaurantRepository, 
                                   OrderItemRepository orderItemRepository, 
                                   MenuItemRepository menuItemRepository) {
        this.restaurantRepository = restaurantRepository;
        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
    }

    // Chạy vào lúc 02:00 sáng mỗi ngày
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void calculateAndSyncBestsellers() {
        log.info("📊 [CRONJOB] Bắt đầu tính toán và đồng bộ cờ Bestseller trong 30 ngày gần nhất...");

        List<Restaurant> activeRestaurants = restaurantRepository.findAll().stream()
                .filter(r -> "ACTIVE".equals(r.getStatus().name()))
                .toList();

        java.time.Instant thirtyDaysAgo = java.time.Instant.now().minus(java.time.Duration.ofDays(30));

        for (Restaurant res : activeRestaurants) {
            // [VÁ LỔ HỔNG HIỆU NĂNG]: Dùng 1 câu lệnh SQL duy nhất để reset, thay vì tải hết lên RAM
            menuItemRepository.resetBestsellerStatusByRestaurantId(res.getId());

            // [VÁ LỖ HỔNG LOGIC]: Chỉ lấy Top bán chạy trong 30 ngày qua
            List<Object[]> topItems = orderItemRepository.findTopSellingItemsByRestaurantIdIn30Days(res.getId(), thirtyDaysAgo, PageRequest.of(0, 3));
            
            List<MenuItem> itemsToUpdate = new java.util.ArrayList<>();
            for (Object[] row : topItems) {
                MenuItem topItem = (MenuItem) row[0];
                topItem.setIsBestseller(true);
                itemsToUpdate.add(topItem);
            }

            // SaveAll một lần duy nhất cho 3 món
            if (!itemsToUpdate.isEmpty()) {
                menuItemRepository.saveAll(itemsToUpdate);
            }
        }
        
        log.info("✅ Hoàn tất đồng bộ Bestseller tự động!");
    }

}
