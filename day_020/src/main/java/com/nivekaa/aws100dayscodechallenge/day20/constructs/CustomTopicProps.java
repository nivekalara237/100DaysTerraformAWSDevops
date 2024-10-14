package com.nivekaa.aws100dayscodechallenge.day20.constructs;

import lombok.Builder;

@Builder
public record CustomTopicProps(
    String topicName, boolean isFifo, Boolean contentBasedDeduplication) {
  public CustomTopicProps(String topicName) {
    this(topicName, false, null);
  }

  public CustomTopicProps(String topicName, boolean isFifo) {
    this(topicName, isFifo, null);
  }
}
