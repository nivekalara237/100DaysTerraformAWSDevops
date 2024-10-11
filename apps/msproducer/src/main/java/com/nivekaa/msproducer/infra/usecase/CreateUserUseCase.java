package com.nivekaa.msproducer.infra.usecase;

import com.nivekaa.msproducer.core.domain.User;
import com.nivekaa.msproducer.core.interactors.UserInteractor;
import com.nivekaa.msproducer.infra.entrypoints.http.request.CreateUserRequest;
import com.nivekaa.msproducer.infra.entrypoints.http.responses.UserCreatedResponse;
import com.nivekaa.msproducer.infra.mappers.UserMapper;
import com.nivekaa.msproducer.infra.usecase.validators.CreateUserValidator;
import org.springframework.stereotype.Component;

@Component
public class CreateUserUseCase {

  private final UserInteractor userInteractor;

  public CreateUserUseCase(UserInteractor interactor) {
    this.userInteractor = interactor;
  }

  public UserCreatedResponse execute(CreateUserRequest request) {
    new CreateUserValidator(request).isValidOrThrow();
    User domain = userInteractor.createUser(UserMapper.toDomain(request));
    return UserMapper.toResponse(domain);
  }

}
