package com.nivekaa.msproducer.core.interactors;

import com.nivekaa.msproducer.core.domain.User;

public interface UserInteractor {
  User createUser(User userRequestMapped);
}
