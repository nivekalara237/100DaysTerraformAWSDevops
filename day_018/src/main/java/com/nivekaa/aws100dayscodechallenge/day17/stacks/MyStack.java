package com.nivekaa.aws100dayscodechallenge.day17.stacks;

import com.nivekaa.aws100dayscodechallenge.day17.constructs.*;
import java.util.List;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.iam.Effect;
import software.amazon.awscdk.services.iam.PolicyStatement;
import software.amazon.awscdk.services.iam.PolicyStatementProps;
import software.amazon.awscdk.services.sqs.IQueue;
import software.constructs.Construct;

public class MyStack extends Stack {
  public MyStack(final Construct scope, final String id) {
    this(scope, id, null);
  }

  public MyStack(final Construct scope, final String id, final StackProps props) {
    super(scope, id, props);

    IVpc vpc = new NetworkContruct(this, "NetworkResource", props).getVpc();

    IQueue genUserCodeQueue =
        new QueueConstruct(
                this,
                "GenerateUserCodeQueueResource",
                new CustomQueueProps("generate-user-code-queue"),
                props)
            .getQueue();

    IQueue indexingUserQueue =
        new QueueConstruct(
                this,
                "IndexingUserQueueResource",
                new CustomQueueProps("indexing-user-queue", true),
                props)
            .getQueue();

    IQueue genCodeQueue =
        new QueueConstruct(
                this, "GenCodeQueueResource", new CustomQueueProps("gen-code-queue"), props)
            .getQueue();

    TopicConstruct topic =
        new TopicConstruct(
            this, "TopicResource", new CustomTopicProps("index-new-user-topic"), props);

    topic.subscribeQueue(genUserCodeQueue);
    topic.subscribeQueue(indexingUserQueue);

    ComputerConstruct genCodeService =
        new ComputerConstruct(
            this,
            "GenCodeServerResource",
            ComputerProps.builder()
                .allowSSHConnection(true)
                .vpc(vpc)
                .instanceName("GenCodeServer")
                .volumeSize(10)
                .enableKeyPair(true)
                .hostedAppPort(8081)
                .bootstrapScript("./gen-code-webserver-startup.sh")
                .build(),
            props);
    genCodeService.addPolicyToComputer(
        PolicyStatement.Builder.create()
            .sid("AllowConsumingSQSMessage")
            .actions(
                List.of(
                    "sqs:DeleteMessage",
                    "sqs:ReceiveMessage",
                    "sqs:GetQueueAttributes",
                    "sqs:GetQueueUrl"))
            .resources(List.of(genUserCodeQueue.getQueueArn()))
            .effect(Effect.ALLOW)
            .build());

    ComputerConstruct userManagementService =
        new ComputerConstruct(
            this,
            "ProducerComputerResource",
            ComputerProps.builder()
                .volumeSize(10)
                .enableKeyPair(true)
                .allowSSHConnection(true)
                .hostedAppPort(8080)
                .vpc(vpc)
                .instanceName("MSProducer")
                .bootstrapScript("./producer-webserver-startup.sh")
                .build(),
            props);

    userManagementService.addPolicyToComputer(
        new PolicyStatement(
            PolicyStatementProps.builder()
                .effect(Effect.ALLOW)
                .actions(List.of("sns:Publish", "sns:ListTopics", "sns:CreateTopic"))
                .resources(List.of(topic.getTopic().getTopicArn()))
                .build()),
        new PolicyStatement(
            PolicyStatementProps.builder()
                .effect(Effect.ALLOW)
                .actions(
                    List.of(
                        "sqs:DeleteMessage",
                        "sqs:ReceiveMessage",
                        "sqs:GetQueueAttributes",
                        "sqs:GetQueueUrl"))
                .resources(List.of(genCodeQueue.getQueueArn()))
                .build()));
  }
}
