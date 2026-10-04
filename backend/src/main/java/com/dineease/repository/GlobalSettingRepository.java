package com.dineease.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dineease.entity.GlobalSetting;

public interface GlobalSettingRepository extends JpaRepository<GlobalSetting, String> {}
