package com.dineease.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dineease.dto.CuisineRequest;
import com.dineease.dto.CuisineResponse;
import com.dineease.service.CuisineService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Admin - Cuisines", description = "Quản trị viên: Quản lý danh mục ẩm thực (Cuisine)")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/admin/cuisines")
public class AdminCuisineController {

    private final CuisineService cuisineService;

    public AdminCuisineController(CuisineService cuisineService) {
        this.cuisineService = cuisineService;
    }

    @Operation(summary = "Lấy tất cả danh mục ẩm thực")
    @GetMapping
    public ResponseEntity<List<CuisineResponse>> getAllCuisines() {
        return ResponseEntity.ok(cuisineService.getAllCuisines());
    }

    @Operation(summary = "Lấy chi tiết 1 danh mục theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<CuisineResponse> getCuisineById(@PathVariable Long id) {
        return ResponseEntity.ok(cuisineService.getCuisineById(id));
    }

    @Operation(summary = "Thêm mới danh mục ẩm thực")
    @PostMapping
    public ResponseEntity<CuisineResponse> createCuisine(
            @Valid @RequestBody CuisineRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        CuisineResponse created = cuisineService.createCuisine(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Cập nhật danh mục ẩm thực")
    @PutMapping("/{id}")
    public ResponseEntity<CuisineResponse> updateCuisine(
            @PathVariable Long id, 
            @Valid @RequestBody CuisineRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        CuisineResponse updated = cuisineService.updateCuisine(id, request, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Xóa danh mục ẩm thực")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCuisine(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        cuisineService.deleteCuisine(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}