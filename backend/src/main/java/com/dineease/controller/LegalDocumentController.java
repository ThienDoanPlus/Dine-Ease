package com.dineease.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.dineease.service.LegalDocumentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Restaurant - Legal Documents", description = "Quản lý hồ sơ pháp lý nhà hàng")
@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/restaurant/legal-documents")
public class LegalDocumentController {

    private final LegalDocumentService legalDocumentService;

    public LegalDocumentController(LegalDocumentService legalDocumentService) {
        this.legalDocumentService = legalDocumentService;
    }

    @Operation(summary = "Đối tác upload hồ sơ pháp lý (Giấy phép, CCCD...)")
    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadDocument(
            @RequestParam("documentName") String documentName,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        
        legalDocumentService.uploadLegalDocument(auth.getName(), documentName, file);
        return ResponseEntity.ok().build();
    }
}
