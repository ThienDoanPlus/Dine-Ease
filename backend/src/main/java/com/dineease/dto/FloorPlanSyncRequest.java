package com.dineease.dto;
import java.util.List;

public record FloorPlanSyncRequest(
    List<TableRequest> tables,
    String architecturalData
) {}
