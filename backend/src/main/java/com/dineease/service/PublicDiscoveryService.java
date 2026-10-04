package com.dineease.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dineease.dto.*;
import com.dineease.entity.*;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.*;

@Service
public class PublicDiscoveryService {
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final CuisineRepository cuisineRepository; 
    private final AmenityRepository amenityRepository;

    public PublicDiscoveryService(RestaurantRepository restaurantRepository, MenuItemRepository menuItemRepository, 
                                  CuisineRepository cuisineRepository, AmenityRepository amenityRepository) {
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.cuisineRepository = cuisineRepository;
        this.amenityRepository = amenityRepository;
    }

    // ==========================================
    // [TÍCH HỢP TỪ YẾN]: LẤY CATEGORY PUBLIC
    // ==========================================
    @Transactional(readOnly = true)
    public List<Cuisine> getAllCuisines() { return cuisineRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<Amenity> getAllAmenities() { return amenityRepository.findAll(); }

    // ==========================================
    // [TÍCH HỢP TỪ YẾN]: TÌM KIẾM NÂNG CAO
    // ==========================================
    @Transactional(readOnly = true)
    public Page<RestaurantPublicResponse> searchRestaurants(
            String keyword, Double minRating, BigDecimal maxPrice, 
            List<Long> cuisineIds, List<Long> amenityIds, Pageable pageable) {
        
        // Đếm số lượng tiện ích khách hàng click (Để chạy logic AND)
        Integer amenityCount = (amenityIds != null && !amenityIds.isEmpty()) ? amenityIds.size() : 0;

        Page<Restaurant> restaurantPage = restaurantRepository.findByAdvancedSearch(
                keyword, minRating, maxPrice, cuisineIds, amenityIds, amenityCount, pageable);


        return restaurantPage.map(r -> {
            String cuisineName = (r.getCuisine() != null) ? r.getCuisine().getName() : "Đa dạng món ăn";
            return new RestaurantPublicResponse(
                r.getId(), r.getName(), r.getAddress(), r.getImageMain(), 
                r.getAvgRating(), r.getAvgPrice(), cuisineName
            );
        });
    }

    // ==========================================
    // [CỦA KHOA]: LOGIC MENU NHIỀU ẢNH (GIỮ NGUYÊN BẢN GỐC)
    // ==========================================
    @Transactional(readOnly = true)
    public List<MenuCategoryPublicResponse> getRestaurantMenu(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) throw new ResourceNotFoundException("Nhà hàng", restaurantId);

        List<MenuItem> allItems = menuItemRepository.findByRestaurantId(restaurantId);
        Map<MenuCategory, List<MenuItem>> groupedMenu = allItems.stream().collect(Collectors.groupingBy(MenuItem::getCategory));
        
        return groupedMenu.entrySet().stream().map(entry -> {
            MenuCategory category = entry.getKey();
            List<MenuItemPublicResponse> itemDtos = entry.getValue().stream().map(item -> {
                // [KHOA]: Map list ảnh từ OneToMany
                List<String> imageUrls = item.getImages().stream()
                        .map(com.dineease.entity.MenuItemImage::getImageUrl).toList();

                return new MenuItemPublicResponse(item.getId(), item.getName(), item.getDescription(),
                    item.getPrice(), imageUrls, item.getIsBestseller());
            }).collect(Collectors.toList());

            return new MenuCategoryPublicResponse(category.getId(), category.getName(), itemDtos);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public com.dineease.dto.RestaurantDetailPublicResponse getRestaurantDetail(Long id) {
        Restaurant r = restaurantRepository.findById(id).filter(res -> res.getStatus() == RestaurantStatus.ACTIVE)
            .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", id));
            
        return new com.dineease.dto.RestaurantDetailPublicResponse(
            r.getId(), r.getName(), r.getAddress(), r.getPhoneContact(),
            r.getDescription(), r.getImageMain(),
            r.getAvgRating() != null ? r.getAvgRating() : 5.0
        );
    }
}