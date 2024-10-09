package com.nivekaa.msproducer.infra.mappers;

import com.nivekaa.msproducer.core.domain.User;
import com.nivekaa.msproducer.infra.entrypoints.http.request.CreateUserRequest;
import com.nivekaa.msproducer.infra.entrypoints.http.responses.UserCreatedResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {
  public UserCreatedResponse toResponse(User domain) {
    return new UserCreatedResponse(domain.reference(), domain.firstName(), domain.lastName(), domain.email(), domain.createdAt());
  }

  public User toDomain(CreateUserRequest request) {
    return new User(null, request.firstName(), request.lastName(), request.email(), null);
  }
}
