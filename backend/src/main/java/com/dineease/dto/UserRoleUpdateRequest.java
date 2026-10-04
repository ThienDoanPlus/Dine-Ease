package com.dineease.dto;

import java.util.Set;
import com.dineease.entity.Role;
import jakarta.validation.constraints.NotEmpty;

public record UserRoleUpdateRequest(
    @NotEmpty(message = "Người dùng phải có ít nhất 1 quyền (Role)")
    Set<Role> roles
) {}
