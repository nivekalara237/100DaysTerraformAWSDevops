package com.nivekaa.snsconsumer.infra.messaging.consumers;

import java.time.Instant;
import java.util.Date;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ExampleSNSConsumer {

    // @SqsListener(queueNames = { "my-queue" })
    public void listen(String payload) {
        log.info("*******************  SQS Payload ***************");
        log.info("Message Content: {}", payload);
        log.info("Received At: {}", Date.from(Instant.now()));
        log.info("************************************************");
    }

}
