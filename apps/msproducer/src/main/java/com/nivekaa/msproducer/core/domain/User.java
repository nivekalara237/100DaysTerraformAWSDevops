package com.nivekaa.msproducer.core.domain;

import java.time.LocalDateTime;

public record User(
    String reference,
    String firstName,
    String lastName,
    String email,
    LocalDateTime createdAt
){
}
