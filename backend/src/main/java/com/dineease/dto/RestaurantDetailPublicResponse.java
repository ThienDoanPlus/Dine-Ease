package com.dineease.dto;

public record RestaurantDetailPublicResponse(
    Long id,
    String name,
    String address,
    String phoneContact,
    String description,
    String imageMain,
    Double avgRating
) {}
