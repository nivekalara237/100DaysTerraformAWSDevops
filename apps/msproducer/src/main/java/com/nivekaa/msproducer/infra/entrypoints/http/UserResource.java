package com.nivekaa.msproducer.infra.entrypoints.http;

import com.nivekaa.msproducer.infra.entrypoints.http.request.CreateUserRequest;
import com.nivekaa.msproducer.infra.entrypoints.http.responses.UserCreatedResponse;
import com.nivekaa.msproducer.infra.usecase.CreateUserUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RequestMapping(value = "/users")
@RequiredArgsConstructor
@RestController
public class UserResource {
  private final CreateUserUseCase createUserUseCase;


  @PostMapping("/createUser")
  public ResponseEntity<UserCreatedResponse> createUser(@RequestBody CreateUserRequest request) {
    return ResponseEntity.created(URI.create("/users"))
        .body(createUserUseCase.execute(request));
  }
}
