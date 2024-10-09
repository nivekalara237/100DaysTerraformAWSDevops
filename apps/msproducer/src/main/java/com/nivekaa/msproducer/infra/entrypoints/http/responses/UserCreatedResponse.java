package com.nivekaa.msproducer.infra.entrypoints.http.responses;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record UserCreatedResponse(
    String ref,
    String firstName,
    String lastName,
    String email,
    LocalDateTime createdAt
) {
}
