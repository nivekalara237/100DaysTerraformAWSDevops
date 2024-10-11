package com.nivekaa.msproducer.core.interactors;

import com.nivekaa.msproducer.core.domain.User;

public interface IndexingUserInteractor {
  void pushUserAsMessage(User domain);
}
