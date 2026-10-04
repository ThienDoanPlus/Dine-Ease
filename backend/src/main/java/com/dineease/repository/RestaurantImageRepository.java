package com.dineease.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.dineease.entity.RestaurantImage;
public interface RestaurantImageRepository extends JpaRepository<RestaurantImage,Long> {
    
}