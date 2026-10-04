package com.dineease.dto;
import java.math.BigDecimal;
import com.dineease.entity.RestaurantStatus;
import java.util.List;

public record RestaurantAdminResponse(
    Long id,
    String name,
    String phoneContact,
    String address,
    String description,
    String imageUrl,
    Double rating,
    BigDecimal commissionRate,
    RestaurantStatus status,
    String ownerEmail,  
    String ownerName,
    String cuisineName,
    List<LegalDocumentResponse> legalDocuments
) {}