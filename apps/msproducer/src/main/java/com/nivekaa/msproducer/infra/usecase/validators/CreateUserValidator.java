package com.nivekaa.msproducer.infra.usecase.validators;

import com.nivekaa.commonutils.validator.AbstractValidator;
import com.nivekaa.msproducer.infra.entrypoints.http.request.CreateUserRequest;
import org.apache.commons.validator.routines.EmailValidator;

import java.util.Objects;

public class CreateUserValidator extends AbstractValidator<CreateUserRequest> {
  public CreateUserValidator(CreateUserRequest request) {
    super(request, "CreateUser");
  }

  @Override
  protected void validate() {
    if (!EmailValidator.getInstance().isValid(getTarget().email())) {
      getResult().reject("Invalid Email");
    }

    if (Objects.isNull(getTarget().firstName()) || Objects.isNull(getTarget().lastName())) {
      getResult().reject("The first and last names must not ne empty");
    }
  }
}
