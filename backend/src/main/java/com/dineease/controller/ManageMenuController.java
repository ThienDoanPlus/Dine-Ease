package com.dineease.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.dineease.dto.MenuItemRequest;
import com.dineease.dto.MenuItemResponse;
import com.dineease.service.ManageMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Restaurant - Menu Management", description = "Chủ nhà hàng: Quản lý thực đơn")
@RestController
@RequestMapping("/api/v1/manage/menu-items")
@SecurityRequirement(name = "bearerAuth") 
public class ManageMenuController {
    private final ManageMenuService manageMenuService;
    public ManageMenuController(ManageMenuService manageMenuService) {
        this.manageMenuService = manageMenuService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách món ăn của nhà hàng")
    public ResponseEntity<List<MenuItemResponse>> getMyMenuItems(Authentication auth) {
        String email = auth.getName();
        return
        ResponseEntity.ok(manageMenuService.getMenuItemsByRestaurant(email));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Thêm một món ăn mới (Hỗ trợ upload NHIỀU ảnh)", description = "Truyền thông tin món ăn vào phần 'data' (chuẩn JSON) và file hình vào phần 'images'.")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @io.swagger.v3.oas.annotations.media.Content(
            encoding = @io.swagger.v3.oas.annotations.media.Encoding(
                name = "data", 
                contentType = "application/json"
            )
        )
    )
    public ResponseEntity<MenuItemResponse> createMenuItem(
    @RequestPart("data") @Valid MenuItemRequest request,
    @RequestPart(value = "images", required = false) List<MultipartFile> images,
    Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
        .body(manageMenuService.createMenuItem(request, images,
        auth.getName()));
    }

    @PutMapping(value = "/{itemId}", consumes =
    MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cập nhật thông tin món ăn (Ghi đè list ảnh)",
    description = "Nếu truyền 'images' mới, hệ thống sẽ upload và đè lên ảnh cũ.")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @io.swagger.v3.oas.annotations.media.Content(
            encoding = @io.swagger.v3.oas.annotations.media.Encoding(
                name = "data", 
                contentType = "application/json"
            )
        )
    )
    public ResponseEntity<MenuItemResponse> updateMenuItem(
    @PathVariable Long itemId,
    @RequestPart("data") @Valid MenuItemRequest request,
    @RequestPart(value = "images", required = false) List<MultipartFile> images,
    Authentication auth) {
        return ResponseEntity.ok(manageMenuService.updateMenuItem(itemId, request, images, auth.getName()));
    }

    @PatchMapping("/{itemId}/status")
    @Operation(summary = "Cập nhật nhanh trạng thái món ăn (Đang bán / Hết hàng)")
    public ResponseEntity<MenuItemResponse> updateMenuItemStatus(
            @PathVariable Long itemId,
            @Valid @RequestBody com.dineease.dto.MenuItemStatusUpdateRequest request,
            Authentication auth) {
        
        return ResponseEntity.ok(manageMenuService.updateMenuItemStatus(itemId, request.status(), auth.getName()));
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Xóa một món ăn")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long itemId,
    Authentication auth) {
    manageMenuService.deleteMenuItem(itemId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}