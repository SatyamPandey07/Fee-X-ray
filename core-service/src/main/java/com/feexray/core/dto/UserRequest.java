package com.feexray.core.dto;

import com.feexray.core.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UserRequest(
    @NotNull(message = "Organization ID is required")
    UUID orgId,

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    String email,

    @NotBlank(message = "Keycloak Subject ID is required")
    String keycloakSubjectId,

    @NotNull(message = "Role is required")
    UserRole role
) {}
