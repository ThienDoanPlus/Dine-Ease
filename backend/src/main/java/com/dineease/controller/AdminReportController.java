package com.dineease.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

import com.dineease.dto.AdminDashboardResponse;
import com.dineease.service.AdminReportService;
import com.dineease.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Arrays;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Admin - Reports & Statistics", description = "Quản trị viên: Xem báo cáo, thống kê doanh thu")
@RestController
@RequestMapping("/api/v1/admin/reports")
@SecurityRequirement(name = "bearerAuth")
public class AdminReportController {

    private final AdminReportService adminReportService;
    private final ExportService exportService;

    public AdminReportController(AdminReportService adminReportService, ExportService exportService) {
        this.adminReportService = adminReportService;
        this.exportService = exportService;
    }

    @Operation(summary = "Lấy dữ liệu tổng quan cho Dashboard", 
               description = "Trả về tổng nhà hàng, tổng đơn, số đơn thành công và tổng hoa hồng. Hỗ trợ lọc theo ngày (startDate, endDate format: YYYY-MM-DD)")
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDate start = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null && !endDate.isBlank()) ? LocalDate.parse(endDate) : null;
        
        AdminDashboardResponse response = adminReportService.getDashboardStats(start, end);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy dữ liệu tỉ lệ đặt bàn theo ẩm thực (Pie Chart)")
    @GetMapping("/cuisine-chart")
    public ResponseEntity<List<Map<String, Object>>> getCuisineChart() {
        return ResponseEntity.ok(adminReportService.getCuisineChartData());
    }

    @Operation(summary = "Lấy dữ liệu doanh thu 7 ngày gần nhất (Area Chart)")
    @GetMapping("/revenue-chart")
    public ResponseEntity<List<Map<String, Object>>> getRevenueChart() {
        return ResponseEntity.ok(adminReportService.getRevenueChartData());
    }

    // ==========================================================
    // [BỔ SUNG]: API TRẢ VỀ DỮ LIỆU TOP RANKING
    // ==========================================================
    @Operation(summary = "Top 5 nhà hàng có doanh thu cao nhất")
    @GetMapping("/top-revenue")
    public ResponseEntity<List<Map<String, Object>>> getTopRevenue() {
        return ResponseEntity.ok(adminReportService.getTopRevenueRestaurants());
    }

    @Operation(summary = "Top 5 nhà hàng bị hủy đơn nhiều nhất")
    @GetMapping("/top-cancelled")
    public ResponseEntity<List<Map<String, Object>>> getTopCancelled() {
        return ResponseEntity.ok(adminReportService.getTopCancelledRestaurants());
    }

    @Operation(summary = "Xuất báo cáo Admin (Excel/PDF)")
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAdminReport(
            @RequestParam String format,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        LocalDate start = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null && !endDate.isBlank()) ? LocalDate.parse(endDate) : null;

        AdminDashboardResponse stats = adminReportService.getDashboardStats(start, end);

        List<String> headers = Arrays.asList("Tổng Nhà Hàng", "Tổng Đơn", "Đơn Thành Công", "Doanh Thu Hoa Hồng (VND)");
        List<List<String>> data = Arrays.asList(
            Arrays.asList(
                String.valueOf(stats.totalRestaurants()),
                String.valueOf(stats.totalReservations()),
                String.valueOf(stats.successfulReservations()),
                stats.totalCommissionRevenue() != null ? stats.totalCommissionRevenue().toString() : "0"
            )
        );

        byte[] fileData;
        String fileName;
        MediaType mediaType;

        if ("excel".equalsIgnoreCase(format)) {
            fileData = exportService.exportToExcel("Báo Cáo Tổng Quan Hệ Thống", headers, data);
            fileName = "Admin_Report.xlsx";
            mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } else {
            fileData = exportService.exportToPdf("Báo Cáo Tổng Quan Hệ Thống", headers, data);
            fileName = "Admin_Report.pdf";
            mediaType = MediaType.APPLICATION_PDF;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(fileData);
    }
}