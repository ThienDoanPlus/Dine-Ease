package com.dineease.dto;
import java.util.List;

public record FloorPlanResponse(
    List<TableResponse> tables,
    String architecturalData
) {}
