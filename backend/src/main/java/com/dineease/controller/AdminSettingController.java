package com.dineease.controller;

import com.dineease.dto.AuditLogResponse;
import com.dineease.dto.UpdateCommissionRequest;
import com.dineease.service.AdminSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@Tag(name = "Admin - System Settings", description = "Quản trị viên: Cấu hình hệ thống và Nhật ký Audit")
@RestController
@RequestMapping("/api/v1/admin/settings")
@SecurityRequirement(name = "bearerAuth")
public class AdminSettingController {

    private final AdminSettingService settingService;

    public AdminSettingController(AdminSettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping("/commission")
    public ResponseEntity<String> getCommission() {
        return ResponseEntity.ok(settingService.getCommission());
    }

    @Operation(summary = "Lấy nhật ký thay đổi hệ thống", description = "Hỗ trợ lọc theo ngày (startDate, endDate format: YYYY-MM-DD)")
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Instant start = (startDate != null && !startDate.isBlank()) ? 
                LocalDate.parse(startDate).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant end = (endDate != null && !endDate.isBlank()) ? 
                LocalDate.parse(endDate).plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("time").descending());
        return ResponseEntity.ok(settingService.getAuditLogs(start, end, pageable));
    }

    @PostMapping("/commission")
    public ResponseEntity<Void> updateCommission(
            @Valid @RequestBody UpdateCommissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        settingService.updateCommission(request, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
