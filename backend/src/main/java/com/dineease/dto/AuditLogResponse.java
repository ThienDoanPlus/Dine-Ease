package com.dineease.dto;
import java.time.Instant;

public record AuditLogResponse(
    Long id,
    Instant time,
    ActorDto actor,
    String action,
    String oldValue,
    String newValue,
    String reason
) {
    public record ActorDto(String name, String avatar) {}
}
