package com.nivekaa.msproducer.infra.data.repository;

import com.nivekaa.msproducer.core.domain.User;
import com.nivekaa.msproducer.core.interactors.IndexingUserInteractor;
import com.nivekaa.msproducer.core.interactors.UserInteractor;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserReposiroty implements UserInteractor {

  private final IndexingUserInteractor indexingUserInteractor;

  private static final Logger log = LoggerFactory.getLogger(UserReposiroty.class);

  @Override
  public User createUser(User domain) {
    log.info("""
        User: {}
        The new User is saved under the data storage (DB)
        """, domain);

    User user = new User(
        "USER+%s".formatted(RandomStringUtils.randomAlphanumeric(16)),
        domain.firstName(),
        domain.lastName(),
        domain.email(),
        LocalDateTime.now());

    indexingUserInteractor.pushUserAsMessage(user);

    log.info("The user have being sent for indexing");
    return user;
  }
}
