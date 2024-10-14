package com.nivekaa.aws100dayscodechallenge.day20.constructs;

import lombok.Getter;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.sns.*;
import software.amazon.awscdk.services.sns.subscriptions.SqsSubscription;
import software.amazon.awscdk.services.sns.subscriptions.SqsSubscriptionProps;
import software.amazon.awscdk.services.sqs.IQueue;
import software.constructs.Construct;

public class TopicConstruct extends Construct {
  @Getter private final ITopic topic;

  public TopicConstruct(Construct scope, String id, CustomTopicProps topicProps) {
    this(scope, id, topicProps, null);
  }

  public TopicConstruct(
      Construct scope, String id, CustomTopicProps topicProps, StackProps stackProps) {
    super(scope, id);

    TopicProps.Builder topicBuilder = TopicProps.builder().topicName(topicProps.topicName());

    if (topicProps.isFifo()) {
      topicBuilder.topicName(
          topicProps.topicName().endsWith(".fifo")
              ? topicProps.topicName()
              : "%s.fifo".formatted(topicProps.topicName()));
      topicBuilder.contentBasedDeduplication(topicProps.contentBasedDeduplication());
    }

    topicBuilder.displayName("%s - SNS TOPIC".formatted(topicProps.topicName().toUpperCase()));
    this.topic =
        new Topic(
            this,
            "CustomTopic%sResource".formatted(topicProps.topicName().toUpperCase()),
            topicBuilder.build());
  }

  public void subscribeQueue(IQueue sqsQueue) {
    this.topic.addSubscription(
        new SqsSubscription(
            sqsQueue, SqsSubscriptionProps.builder().rawMessageDelivery(true).build()));
  }
}
