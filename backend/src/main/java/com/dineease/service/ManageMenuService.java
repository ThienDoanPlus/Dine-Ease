package com.dineease.service;

import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dineease.dto.MenuCategoryRequest;
import com.dineease.dto.MenuCategoryResponse;
import com.dineease.dto.MenuItemRequest;
import com.dineease.dto.MenuItemResponse;
import com.dineease.entity.MenuCategory;
import com.dineease.entity.MenuItem;
import com.dineease.entity.MenuItemStatus;
import com.dineease.entity.Restaurant;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.MenuCategoryRepository;
import com.dineease.repository.MenuItemRepository;
import com.dineease.repository.RestaurantRepository;

@Service
public class ManageMenuService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuCategoryRepository categoryRepository;
    private final FileUploadService fileUploadService;

    public ManageMenuService(MenuItemRepository menuItemRepository,
    RestaurantRepository restaurantRepository,
    MenuCategoryRepository categoryRepository,
    FileUploadService fileUploadService) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
        this.categoryRepository = categoryRepository;
        this.fileUploadService = fileUploadService;
    }

    // KHÔNG GẮN @Transactional Ở ĐÂY để tránh giữ kết nối DB khi upload ảnh lên Cloudinary
    public MenuItemResponse createMenuItem(MenuItemRequest request, List<MultipartFile> images, String email) {
        // 1. Thực hiện Upload ảnh trước (Tốn 10s nhưng KHÔNG giữ kết nối Database)
        List<String> uploadedUrls = new java.util.ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                if (!img.isEmpty()) {
                    uploadedUrls.add(fileUploadService.uploadFile(img));
                }
            }
        }

        // 2. Chuyển sang một hàm @Transactional nội bộ (hoặc làm trực tiếp vì .save() tự có Transaction)
        Restaurant restaurant = restaurantRepository.findByOwnerEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa đăng ký nhà hàng!"));
        MenuCategory category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        
        MenuItem item = MenuItem.builder()
            .name(request.name())
            .description(request.description())
            .price(request.price())
            .category(category)
            .restaurant(restaurant)
            .status(MenuItemStatus.AVAILABLE)
            .isBestseller(false)
            .build();

        for (String url : uploadedUrls) {
            item.getImages().add(com.dineease.entity.MenuItemImage.builder()
                .imageUrl(url)
                .menuItem(item)
                .build());
        }
        MenuItem savedItem = menuItemRepository.save(item);
        updateRestaurantAvgPrice(restaurant); // <--- THÊM DÒNG NÀY
        return mapToResponse(savedItem);
    }



    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuItemsByRestaurant(String email) {
        return menuItemRepository.findByRestaurantOwnerEmail(email).stream()
            // Lọc bỏ các món ăn đã bị Xóa mềm (HIDDEN)
            .filter(item -> item.getStatus() != MenuItemStatus.HIDDEN)
            .map(this::mapToResponse)
            .toList();
    }

    // GẮN @Transactional CHO UPDATE VÌ CẦN CLEAR LIST ẢNH (Orphan Removal)
    @Transactional
    public MenuItemResponse updateMenuItem(Long itemId, MenuItemRequest request, List<MultipartFile> images, String email) {
        MenuItem item = menuItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Món ăn không tồn tại"));

        
        if (!item.getRestaurant().getOwner().getEmail().equals(email)) {
            throw new AccessDeniedException("Bạn không có quyền sửa món ăn này");
        }
        item.setName(request.name());
        item.setDescription(request.description());
        item.setPrice(request.price());
        
        if (!item.getCategory().getId().equals(request.categoryId())) {
            MenuCategory newCategory = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
            item.setCategory(newCategory);
        }
        
        // ==========================================================
        // [VÁ LỖ HỔNG ẢNH BÓNG MA]: XỬ LÝ ẢNH CŨ VÀ MỚI ĐỘC LẬP
        // ==========================================================
        
        // 1. Xử lý ảnh cũ (Xóa những ảnh không còn nằm trong danh sách retainedImageUrls)
        List<String> retainedUrls = request.retainedImageUrls() != null ? request.retainedImageUrls() : new java.util.ArrayList<>();
        
        java.util.Iterator<com.dineease.entity.MenuItemImage> iterator = item.getImages().iterator();
        while (iterator.hasNext()) {
            com.dineease.entity.MenuItemImage oldImg = iterator.next();
            
            // Nếu ảnh cũ này KHÔNG có mặt trong danh sách cần giữ lại -> Xóa
            if (!retainedUrls.contains(oldImg.getImageUrl())) {
                final String urlToDelete = oldImg.getImageUrl();
                
                // Đẩy lệnh xóa Cloudinary vào luồng chạy ngầm để tránh treo Database Connection
                java.util.concurrent.CompletableFuture.runAsync(() -> fileUploadService.deleteFile(urlToDelete));
                
                // Xóa khỏi Collection (Hibernate Orphan Removal sẽ tự động xóa dòng này dưới DB)
                iterator.remove(); 
            }
        }

        // 2. Thêm ảnh mới tải lên (nếu có)
        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                if (!img.isEmpty()) {
                    String url = fileUploadService.uploadFile(img);
                    item.getImages().add(com.dineease.entity.MenuItemImage.builder()
                            .imageUrl(url)
                            .menuItem(item)
                            .build());
                }
            }
        }
        // ==========================================================


        MenuItem savedItem = menuItemRepository.save(item);
        updateRestaurantAvgPrice(item.getRestaurant()); // <--- THÊM DÒNG NÀY
        return mapToResponse(savedItem);
    }


        
    @Transactional
    public void deleteMenuItem(Long itemId, String email) {

        MenuItem item = menuItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Món ăn không tồn tại"));
            
        if (!item.getRestaurant().getOwner().getEmail().equals(email)) {
            throw new AccessDeniedException("Bạn không có quyền xóa món ăn này");
        }

        // Chuyển từ Xóa cứng (Hard Delete) sang Xóa mềm (Soft Delete)
        // Không gọi fileUploadService.deleteFile(imageUrl) để giữ lại ảnh cho lịch sử POS
        item.setStatus(MenuItemStatus.HIDDEN);
        menuItemRepository.save(item);
        updateRestaurantAvgPrice(item.getRestaurant()); // <--- THÊM DÒNG NÀY
    }


    @Transactional
    public MenuItemResponse updateMenuItemStatus(Long itemId, MenuItemStatus newStatus, String email) {
        MenuItem item = menuItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Món ăn không tồn tại"));
            
        // Kiểm tra bảo mật IDOR
        if (!item.getRestaurant().getOwner().getEmail().equals(email)) {
            throw new AccessDeniedException("Bạn không có quyền thao tác trên món ăn này");
        }

        // Chặn không cho dùng API này để Xóa mềm (Tránh nhầm lẫn với API Delete)
        if (newStatus == MenuItemStatus.HIDDEN) {
            throw new IllegalArgumentException("Vui lòng dùng chức năng Xóa để ẩn món ăn.");
        }

        item.setStatus(newStatus);
        MenuItem savedItem = menuItemRepository.save(item);
        updateRestaurantAvgPrice(item.getRestaurant()); // <--- THÊM DÒNG NÀY
        return mapToResponse(savedItem);
    }

    
    private MenuItemResponse mapToResponse(MenuItem item) {
        List<String> imageUrls = item.getImages().stream()
                .map(com.dineease.entity.MenuItemImage::getImageUrl)
                .toList();

        return new MenuItemResponse(
            item.getId(),
            item.getName(),
            item.getDescription(),
            item.getPrice(), // Trả về BigDecimal
            imageUrls,
            item.getIsBestseller(),
            item.getStatus(),
            item.getCategory().getName()
        );
    }

    // ==========================================
    // QUẢN LÝ DANH MỤC (TỪ CODE CỦA ĐOAN)
    // ==========================================
    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> getMyCategories(String email) {
        return categoryRepository.findByRestaurantOwnerEmail(email).stream()
            .map(c -> new MenuCategoryResponse(c.getId(), c.getName()))
            .toList();
    }

    @Transactional
    public MenuCategoryResponse createCategory(MenuCategoryRequest request, String email) {

        Restaurant restaurant = restaurantRepository.findByOwnerEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng không tồn tại"));

        MenuCategory category = MenuCategory.builder()
            .name(request.name())
            .restaurant(restaurant)
            .sortOrder(0) 
            .build();

        MenuCategory saved = categoryRepository.save(category);
        return new MenuCategoryResponse(saved.getId(), saved.getName());
    }

    @Transactional
    public void deleteCategory(Long categoryId, String email) {

        MenuCategory category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));

        if (!category.getRestaurant().getOwner().getEmail().equals(email)) {
            throw new AccessDeniedException("Bạn không có quyền xóa danh mục này");
        }

        // --- BỔ SUNG ĐOẠN CHECK NÀY ĐỂ VÁ LỖ HỔNG (FIX TEST CASE 15) ---
        if (category.getMenuItems() != null && !category.getMenuItems().isEmpty()) {
            throw new IllegalStateException("Không thể xóa! Danh mục '" + category.getName() + "' vẫn còn món ăn bên trong. Vui lòng xóa hoặc chuyển món ăn sang danh mục khác trước.");
        }
        
        categoryRepository.delete(category);
    }

    // ==========================================================
    // [VÁ LỖ HỔNG AVG PRICE]: HÀM TÍNH LẠI TRUNG BÌNH GIÁ NHÀ HÀNG
    // ==========================================================
    private void updateRestaurantAvgPrice(Restaurant restaurant) {
        java.math.BigDecimal avg = menuItemRepository.getAveragePriceByRestaurantId(restaurant.getId());
        restaurant.setAvgPrice(avg != null ? avg : java.math.BigDecimal.ZERO);
        restaurantRepository.save(restaurant);
    }
}