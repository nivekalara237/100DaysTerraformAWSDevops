package com.nivekaa.gencode.infra.messaging.consumers;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nivekaa.gencode.core.domain.User;
import com.nivekaa.gencode.core.interactors.LocalStorageInteractor;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisterSQSConsumer {

    private final LocalStorageInteractor storageInteractor;

    @SneakyThrows
    @SqsListener(queueNames = { "${sqs.queue.gen-code}" })
    public void listen(String payload) {
        log.info("""
        *******************  SQS Payload ***************"
        * Message Content: {}
        * Received At: {}
        ************************************************""",
            payload, Date.from(Instant.now()));

        ObjectMapper objectMapper = new ObjectMapper();

        User user = objectMapper.readValue(payload, User.class);
    storageInteractor.appendLine(
        "users-code.csv",
        "%s;%s;%s;%s"
            .formatted(
                user.reference(),
                user.email(),
                RandomStringUtils.randomNumeric(8),
                LocalDateTime.now()));
    }

}
