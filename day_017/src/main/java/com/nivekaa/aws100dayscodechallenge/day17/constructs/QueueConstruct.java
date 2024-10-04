package com.nivekaa.aws100dayscodechallenge.day17.constructs;

import software.amazon.awscdk.Duration;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.sqs.DeadLetterQueue;
import software.amazon.awscdk.services.sqs.IQueue;
import software.amazon.awscdk.services.sqs.Queue;
import software.amazon.awscdk.services.sqs.QueueProps;
import software.constructs.Construct;

public class QueueConstruct extends Construct {

  private final IQueue queue;

  public QueueConstruct(Construct scope, String id, IVpc vpc, StackProps props) {
    super(scope, id);

    IQueue dlq =
        new Queue(
            this,
            "DeadLetterQueue",
            QueueProps.builder()
                .deliveryDelay(Duration.millis(0))
                .retentionPeriod(Duration.days(10))
                .queueName("my-queue-dlq")
                .build());

    DeadLetterQueue deadLetterQueue =
        DeadLetterQueue.builder().queue(dlq).maxReceiveCount(32).build();

    this.queue =
        new Queue(
            this,
            "SQSQueueResource",
            QueueProps.builder()
                .queueName("my-queue")
                .retentionPeriod(Duration.minutes(15))
                .visibilityTimeout(Duration.seconds(90))
                .deadLetterQueue(deadLetterQueue)
                .build());
  }

  public IQueue getQueue() {
    return queue;
  }
}
