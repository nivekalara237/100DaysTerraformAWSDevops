package com.nivekaa.snsconsumer.infra.entrypoints.http;

import io.awspring.cloud.sns.annotation.endpoint.NotificationMessageMapping;
import io.awspring.cloud.sns.annotation.endpoint.NotificationSubscriptionMapping;
import io.awspring.cloud.sns.annotation.endpoint.NotificationUnsubscribeConfirmationMapping;
import io.awspring.cloud.sns.annotation.handlers.NotificationMessage;
import io.awspring.cloud.sns.annotation.handlers.NotificationSubject;
import io.awspring.cloud.sns.handlers.NotificationStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/topics/${sns.topic.name}")
@Slf4j
public class ConsumeNotificationResource {

  @NotificationSubscriptionMapping
  public void confirmSubscription(NotificationStatus status) {
    status.confirmSubscription();
    log.info("Subscription confirmed");
  }

  @NotificationMessageMapping
  public void receiveMessage(@NotificationSubject String subject, @NotificationMessage String message) {
    log.info(
        """
        ************************* SNS Notification ***************
        * Subject : {}
        * Content: {}
        * Date : {}
        *********************************************************
        """,
        subject,
        message,
        LocalDateTime.now());
  }

  @NotificationUnsubscribeConfirmationMapping
  public void unsubscribe(NotificationStatus status) {
    status.confirmSubscription();
    log.info("Unsubscription confirmed");
  }
}
