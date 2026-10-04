package com.dineease.dto;

import java.util.List;

public record KanbanBoardResponse(
    List<ManageReservationResponse> pending,
    List<ManageReservationResponse> confirmed,
    List<ManageReservationResponse> finalCol
) {}
