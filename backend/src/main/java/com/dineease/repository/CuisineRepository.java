package com.dineease.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dineease.entity.Cuisine;

public interface CuisineRepository extends JpaRepository<Cuisine, Long> {
    
    // Kiểm tra tên danh mục có bị trùng không (dùng khi Create/Update)
    boolean existsByNameIgnoreCase(String name);
    
    // Kiểm tra tên trùng nhưng loại trừ ID hiện tại (dùng khi Update)
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}