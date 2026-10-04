package com.dineease.controller;

import com.dineease.service.ExportService;
import com.dineease.service.ManageReportService;
import com.dineease.repository.OrderRepository;
import com.dineease.dto.TopSellingItemResponse;
import com.dineease.dto.RestaurantDashboardResponse;
import com.dineease.dto.TransactionHistoryResponse;
import com.dineease.entity.Order;
import com.dineease.entity.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Restaurant - Reports", description = "Chủ nhà hàng: Xuất báo cáo hoạt động")
@RestController
@RequestMapping("/api/v1/manage/reports")
@SecurityRequirement(name = "bearerAuth")
public class ManageReportController {

    private final OrderRepository orderRepository;
    private final ExportService exportService;
    private final ManageReportService manageReportService;

    public ManageReportController(OrderRepository orderRepository, ExportService exportService, ManageReportService manageReportService) {
        this.orderRepository = orderRepository;
        this.exportService = exportService;
        this.manageReportService = manageReportService;
    }

    @Operation(summary = "Xuất báo cáo doanh thu POS nhà hàng (Excel/PDF)")
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportRestaurantReport(@RequestParam String format, Authentication auth) {
        
        // Lấy các hóa đơn POS đã hoàn thành của nhà hàng này
        List<Order> orders = orderRepository.findByRestaurantOwnerEmailAndStatus(auth.getName(), OrderStatus.COMPLETED);

        List<String> headers = Arrays.asList("Mã Đơn", "Bàn", "Tổng Tiền (VND)", "Thời Gian");
        List<List<String>> data = orders.stream().map(order -> Arrays.asList(
            order.getOrderCode(),
            order.getTable() != null ? order.getTable().getTableName() : "Vãng lai",
            order.getTotalAmount() != null ? order.getTotalAmount().toString() : "0",
            order.getCreatedAt() != null ? order.getCreatedAt().toString() : ""
        )).collect(Collectors.toList());

        byte[] fileData;
        String fileName;
        MediaType mediaType;

        if ("excel".equalsIgnoreCase(format)) {
            fileData = exportService.exportToExcel("Báo Cáo Doanh Thu Nhà Hàng", headers, data);
            fileName = "Restaurant_Report.xlsx";
            mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } else {
            fileData = exportService.exportToPdf("Bao Cao Doanh Thu Nha Hang", headers, data);
            fileName = "Restaurant_Report.pdf";
            mediaType = MediaType.APPLICATION_PDF;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(fileData);
    }

    @Operation(summary = "Lấy danh sách Top món bán chạy nhất")
    @GetMapping("/top-items")
    public ResponseEntity<List<TopSellingItemResponse>> getTopSellingItems(Authentication auth) {
        return ResponseEntity.ok(manageReportService.getTopSellingItems(auth.getName()));
    }

    @Operation(summary = "Lấy dữ liệu tổng quan cho Dashboard nhà hàng")
    @GetMapping("/dashboard")
    public ResponseEntity<RestaurantDashboardResponse> getDashboardData(
            @RequestParam(defaultValue = "today") String period,
            Authentication auth) {
        return ResponseEntity.ok(manageReportService.getDashboardOverview(auth.getName(), period));
    }

    @Operation(summary = "Lấy 10 giao dịch gần nhất")
    @GetMapping("/recent-transactions")
    public ResponseEntity<List<TransactionHistoryResponse>> getRecentTransactions(Authentication auth) {
        return ResponseEntity.ok(manageReportService.getRecentTransactions(auth.getName()));
    }
}
