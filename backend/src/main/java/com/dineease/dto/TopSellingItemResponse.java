package com.dineease.dto;

public record TopSellingItemResponse(
    Long id, 
    String name, 
    Long orders, 
    Integer percent, 
    String img
) {}
