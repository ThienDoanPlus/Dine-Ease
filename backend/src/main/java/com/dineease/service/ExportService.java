package com.dineease.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.BaseFont;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    public byte[] exportToExcel(String title, List<String> headers, List<List<String>> data) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Report");

            // Tạo Header Row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < headers.size(); i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            // Đổ Data
            int rowIdx = 1;
            for (List<String> rowData : data) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                for (int i = 0; i < rowData.size(); i++) {
                    row.createCell(i).setCellValue(rowData.get(i));
                }
            }

            // Auto size column
            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xuất file Excel: " + e.getMessage());
        }
    }

    public byte[] exportToPdf(String title, List<String> headers, List<List<String>> data) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. TẢI FONT HỖ TRỢ TIẾNG VIỆT TỪ RESOURCES (UTF-8)
            // (Đảm bảo bạn đã đặt file arial.ttf vào src/main/resources/fonts/)
            BaseFont bf = BaseFont.createFont("/fonts/arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);

            // 2. TẠO CÁC STYLE FONT MỚI
            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(bf, 18, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font headerFont = new com.lowagie.text.Font(bf, 12, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font dataFont = new com.lowagie.text.Font(bf, 12, com.lowagie.text.Font.NORMAL);

            // Tiêu đề
            Paragraph p = new Paragraph(title, titleFont); // Dùng font mới
            p.setAlignment(Element.ALIGN_CENTER);
            document.add(p);
            document.add(new Paragraph(" ")); // Dòng trống

            // Table
            PdfPTable table = new PdfPTable(headers.size());
            table.setWidthPercentage(100);

            // Headers
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont)); // Dùng font mới
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPaddingBottom(8f);
                table.addCell(cell);
            }

            // Data
            for (List<String> rowData : data) {
                for (String cellData : rowData) {
                    PdfPCell cell = new PdfPCell(new Phrase(cellData, dataFont)); // Dùng font mới
                    cell.setPaddingBottom(6f);
                    table.addCell(cell);
                }
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xuất file PDF: " + e.getMessage());
        }
    }
}
