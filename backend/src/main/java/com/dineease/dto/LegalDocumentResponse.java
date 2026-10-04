package com.dineease.dto;
import java.time.Instant;

public record LegalDocumentResponse(
    Long id,
    String documentName,
    String fileUrl,
    Instant createdAt
) {}
