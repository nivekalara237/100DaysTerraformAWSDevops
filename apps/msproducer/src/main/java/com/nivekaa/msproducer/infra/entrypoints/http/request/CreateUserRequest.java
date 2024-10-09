package com.nivekaa.msproducer.infra.entrypoints.http.request;

public record CreateUserRequest(
    String firstName,
    String lastName,
    String email
) {
}
