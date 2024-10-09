package com.nivekaa.aws100dayscodechallenge.day17.constructs;

import software.amazon.awscdk.services.sqs.DeduplicationScope;
import software.amazon.awscdk.services.sqs.FifoThroughputLimit;
import software.amazon.awscdk.services.sqs.QueueEncryption;

public record CustomQueueProps(
    String queueName,
    boolean hasDeadLetterQueue,
    boolean isFifo,
    boolean enableHighThroughput,
    FifoHightThroughputConfig throughputConfig,
    boolean enableEncryption,
    QueueEncryption encryption) {
  public CustomQueueProps(String queueName) {
    this(queueName, false, false, false, null, false, null);
  }

  public CustomQueueProps(String queueName, boolean hasDeadLetterQueue) {
    this(queueName, hasDeadLetterQueue, false, false, null, false, null);
  }

  public CustomQueueProps(String queueName, boolean hasDeadLetterQueue, boolean isFifo) {
    this(queueName, hasDeadLetterQueue, isFifo, false, null, false, null);
  }

  public CustomQueueProps(
      String queueName, boolean hasDeadLetterQueue, boolean isFifo, boolean enableHighThroughput) {
    this(queueName, hasDeadLetterQueue, isFifo, enableHighThroughput, null, false, null);
  }

  public CustomQueueProps(
      String queueName,
      boolean hasDeadLetterQueue,
      boolean isFifo,
      FifoHightThroughputConfig throughputConfig) {
    this(queueName, hasDeadLetterQueue, isFifo, false, throughputConfig, false, null);
  }

  public CustomQueueProps(
      String queueName,
      boolean hasDeadLetterQueue,
      boolean isFifo,
      FifoHightThroughputConfig throughputConfig,
      boolean enableEncryption,
      QueueEncryption encryption) {
    this(
        queueName,
        hasDeadLetterQueue,
        isFifo,
        false,
        throughputConfig,
        enableEncryption,
        encryption);
  }

  public record FifoHightThroughputConfig(FifoThroughputLimit limit, DeduplicationScope scope) {}
}
