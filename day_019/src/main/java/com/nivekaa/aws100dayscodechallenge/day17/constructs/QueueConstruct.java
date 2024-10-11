package com.nivekaa.aws100dayscodechallenge.day17.constructs;

import java.util.Objects;
import software.amazon.awscdk.Duration;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.sqs.*;
import software.constructs.Construct;

public class QueueConstruct extends Construct {

  private final IQueue queue;

  public QueueConstruct(Construct scope, String id, CustomQueueProps queueProps, StackProps props) {
    super(scope, id);

    QueueProps.Builder queueBuilder =
        QueueProps.builder()
            .queueName(queueProps.queueName() + "-main")
            .retentionPeriod(Duration.minutes(2))
            .visibilityTimeout(Duration.minutes(1));

    QueueProps.Builder dlqBuilder =
        QueueProps.builder()
            .visibilityTimeout(Duration.minutes(1))
            .retentionPeriod(Duration.days(14))
            .queueName("%s-dlq".formatted(queueProps.queueName()));

    if (queueProps.isFifo()) {
      queueBuilder.fifo(true);
      queueBuilder.queueName("%s-main.fifo".formatted(queueProps.queueName()));
      queueBuilder.queueName("%s-dlq.fifo".formatted(queueProps.queueName()));
      if (queueProps.enableHighThroughput()) {
        queueBuilder.fifoThroughputLimit(FifoThroughputLimit.PER_MESSAGE_GROUP_ID);
        queueBuilder.deduplicationScope(DeduplicationScope.MESSAGE_GROUP);
        dlqBuilder.fifoThroughputLimit(FifoThroughputLimit.PER_MESSAGE_GROUP_ID);
        dlqBuilder.deduplicationScope(DeduplicationScope.MESSAGE_GROUP);
      } else {
        if (Objects.nonNull(queueProps.throughputConfig().limit())) {
          queueBuilder.fifoThroughputLimit(queueProps.throughputConfig().limit());
          dlqBuilder.fifoThroughputLimit(queueProps.throughputConfig().limit());
        }
        if (Objects.nonNull(queueProps.throughputConfig().scope())) {
          queueBuilder.deduplicationScope(queueProps.throughputConfig().scope());
          dlqBuilder.deduplicationScope(queueProps.throughputConfig().scope());
        }
      }
    }

    if (queueProps.enableEncryption()) {
      queueBuilder.encryption(queueProps.encryption());
      dlqBuilder.encryption(queueProps.encryption());
    }

    if (queueProps.hasDeadLetterQueue()) {
      IQueue dlq = new Queue(this, "DeadLetterQueue", dlqBuilder.build());

      DeadLetterQueue deadLetterQueue =
          DeadLetterQueue.builder().queue(dlq).maxReceiveCount(32).build();
      queueBuilder.deadLetterQueue(deadLetterQueue);
    }

    this.queue = new Queue(this, "SQSQueueResource", queueBuilder.build());
  }

  public IQueue getQueue() {
    return queue;
  }
}
