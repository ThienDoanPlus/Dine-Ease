package com.dineease.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dineease.entity.MenuItemOptionChoice;

public interface MenuItemOptionChoiceRepository extends JpaRepository<MenuItemOptionChoice, Long> {
}
