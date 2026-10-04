package com.dineease.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.dineease.entity.AuditLog;
import java.time.Instant;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // [ĐÃ FIX]: Bỏ cast()
    @Query("SELECT a FROM AuditLog a WHERE (:start IS NULL OR a.time >= :start) AND (:end IS NULL OR a.time <= :end)")
    Page<AuditLog> findByTimeBetween(@Param("start") Instant start, @Param("end") Instant end, Pageable pageable);
}
