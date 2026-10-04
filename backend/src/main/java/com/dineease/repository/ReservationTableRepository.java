package com.dineease.repository;

import com.dineease.entity.ReservationTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationTableRepository extends JpaRepository<ReservationTable, Long> {
}