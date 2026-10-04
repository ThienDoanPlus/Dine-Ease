package com.dineease.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.dineease.entity.MenuCategory;

public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long>{
    List<MenuCategory> findByRestaurantOwnerEmail(String email);
}