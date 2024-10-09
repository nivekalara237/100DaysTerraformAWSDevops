package com.nivekaa.msproducer.infra.messaging.producers;

import com.nivekaa.msproducer.core.domain.User;
import com.nivekaa.msproducer.core.interactors.IndexingUserInteractor;
import io.awspring.cloud.sns.core.SnsNotification;
import io.awspring.cloud.sns.core.SnsOperations;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class IndexingUserProducer implements IndexingUserInteractor {
  private final SnsOperations snsOperations;

  private @Value("${sns.topic.users}") String userTopic;

  @Override
  public void pushUserAsMessage(User payload) {
    SnsNotification<User> notification = SnsNotification.builder(payload)
        .build();
    snsOperations.sendNotification(userTopic, notification);
  }
}
