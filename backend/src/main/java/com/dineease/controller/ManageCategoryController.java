package com.dineease.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.dineease.dto.MenuCategoryRequest;
import com.dineease.dto.MenuCategoryResponse;
import com.dineease.service.ManageMenuService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Restaurant - Menu Category", description = "Chủ nhà hàng: Quản lý Danh mục món ăn (Category)")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/manage/categories")
public class ManageCategoryController {

    private final ManageMenuService manageMenuService;

    public ManageCategoryController(ManageMenuService manageMenuService) {
        this.manageMenuService = manageMenuService;
    }

    @Operation(summary = "Lấy danh sách các Danh mục món ăn của quán")
    @GetMapping
    public ResponseEntity<List<MenuCategoryResponse>> getMyCategories(Authentication auth) {
        return ResponseEntity.ok(manageMenuService.getMyCategories(auth.getName()));
    }

    @Operation(summary = "Tạo Danh mục món ăn mới")
    @PostMapping
    public ResponseEntity<MenuCategoryResponse> createCategory(@Valid @RequestBody MenuCategoryRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(manageMenuService.createCategory(request, auth.getName()));
    }

    @Operation(summary = "Xóa một Danh mục")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, Authentication auth) {
        manageMenuService.deleteCategory(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
