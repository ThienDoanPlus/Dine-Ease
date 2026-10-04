package com.dineease.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.dineease.dto.FloorPlanResponse;
import com.dineease.dto.FloorPlanSyncRequest;
import com.dineease.dto.TableRequest;
import com.dineease.dto.TableResponse;
import com.dineease.service.ManageTableService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Restaurant - Table Management", description = "Chủ nhà hàng: Quản lý sơ đồ bàn")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/manage/tables")
public class ManageTableController {
    
    private final ManageTableService manageTableService;

    // Thay thế @RequiredArgsConstructor bằng Constructor tường minh theo chuẩn của bạn
    public ManageTableController(ManageTableService manageTableService) {
        this.manageTableService = manageTableService;
    }

    @Operation(summary = "Lấy danh sách tất cả các bàn")
    @GetMapping
    public ResponseEntity<List<TableResponse>> getMyTables(Authentication auth) {
        String email = auth.getName();
        List<TableResponse> responses = manageTableService.getTablesByRestaurant(email);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Thêm một bàn mới vào sơ đồ (Cách cũ)")
    @PostMapping
    public ResponseEntity<TableResponse> createTable(
            @Valid @RequestBody TableRequest request, 
            Authentication auth) {
        
        String email = auth.getName();
        TableResponse response = manageTableService.createTable(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==========================================
    // TỪ CODE CỦA ĐOAN: KÉO THẢ SƠ ĐỒ BÀN
    // ==========================================

    @Operation(summary = "Lấy toàn bộ sơ đồ (Danh sách bàn + Kiến trúc tường/cửa)", 
               description = "Dùng để render Canvas sơ đồ bàn")
    @GetMapping("/floor-plan")
    public ResponseEntity<FloorPlanResponse> getMyFloorPlan(Authentication auth) {
        return ResponseEntity.ok(manageTableService.getFloorPlanData(auth.getName()));
    }

    @Operation(summary = "Đồng bộ lưu sơ đồ từ Frontend", 
               description = "Nhận mảng JSON các bàn và lưu toàn bộ trạng thái kéo thả")
    @PostMapping("/sync")
    public ResponseEntity<Void> syncFloorPlan(@RequestBody FloorPlanSyncRequest request, Authentication auth) {
        manageTableService.syncFloorPlan(request, auth.getName());
        return ResponseEntity.ok().build();
    }
}