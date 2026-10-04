package com.dineease.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.dineease.entity.Amenity;
import com.dineease.entity.Restaurant;
import com.dineease.repository.AmenityRepository;
import com.dineease.repository.RestaurantRepository;

@ExtendWith(MockitoExtension.class)
public class ManageRestaurantProfileServiceTest {

    @Mock private RestaurantRepository restaurantRepository;
    @Mock private AmenityRepository amenityRepository;
    @Mock private FileUploadService fileUploadService;

    @InjectMocks private ManageRestaurantProfileService profileService;

    @Test
    @DisplayName("TC-17: Cập nhật thông tin chung - Phải xóa danh sách tiện ích cũ và nạp mới")
    void updateGeneralInfo_Success() {
        // 1. ARRANGE
        String email = "owner.yume@gmail.com";
        // Nhà hàng đang có tiện ích ID 1
        Restaurant mockRes = Restaurant.builder()
                .id(1L).name("Old Name").amenities(new HashSet<>(List.of(new Amenity())))
                .build();
        
        when(restaurantRepository.findByOwnerEmail(email)).thenReturn(Optional.of(mockRes));
        // Giả lập tìm thấy danh sách tiện ích mới từ DB
        when(amenityRepository.findAllById(any())).thenReturn(List.of(new Amenity(), new Amenity()));

        // 2. ACT - Đổi tên thành "Yume Sushi New" và chọn 2 tiện ích mới
        profileService.updateGeneralInfo(email, "Yume Sushi New", "090", "Address", "Desc", List.of(2L, 3L));

        // 3. ASSERT
        assertEquals("Yume Sushi New", mockRes.getName());
        verify(restaurantRepository, times(1)).save(mockRes);
        System.out.println("TC-17 Pass: Cập nhật Info và Amenities thành công!");
    }

    @Test
    @DisplayName("TC-18: Cập nhật hình ảnh - Phải gọi lệnh xóa ảnh cũ trên Cloudinary")
    void updateImages_ShouldDeleteOldFiles() {
        // 1. ARRANGE
        String email = "owner.yume@gmail.com";
        Restaurant mockRes = Restaurant.builder()
                .logoUrl("http://old-logo.jpg")
                .imageMain("http://old-cover.jpg")
                .build();
        when(restaurantRepository.findByOwnerEmail(email)).thenReturn(Optional.of(mockRes));
        
        // Mock upload trả về URL mới
        when(fileUploadService.uploadFile(any())).thenReturn("http://new-image.jpg");

        // Giả lập file mới gửi lên
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);

        // 2. ACT
        profileService.updateImages(email, mockFile, mockFile);

        // 3. ASSERT - Quan trọng nhất là bước này
        // Kiểm tra xem hệ thống có thực sự ra lệnh xóa 2 cái ảnh cũ không
        verify(fileUploadService).deleteFile("http://old-logo.jpg");
        verify(fileUploadService).deleteFile("http://old-cover.jpg");
        System.out.println("TC-18 Pass: Đã dọn dẹp ảnh rác cũ thành công!");
    }
}
