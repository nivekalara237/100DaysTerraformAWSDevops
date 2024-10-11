package com.nivekaa.sqsconsumer.infra.messaging.consumers;

import java.time.LocalDateTime;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ExampleSQSConsumer {

    @SqsListener(queueNames = { "${sqs.queue.index-user}" })
    public void listen(String payload) {
        log.info("""
        
        *******************  SQS Payload ***************
        * User Info: {}
        * Received At: {}
        ************************************************
        
        """, payload, LocalDateTime.now());
    }

}
