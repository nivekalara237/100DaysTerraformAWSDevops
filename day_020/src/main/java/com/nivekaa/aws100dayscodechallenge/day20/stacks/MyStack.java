package com.nivekaa.aws100dayscodechallenge.day20.stacks;

import com.nivekaa.aws100dayscodechallenge.day20.constructs.*;
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
                this, "GenerateUserCodeQueueResource", new CustomQueueProps("CodeGenQueue"), props)
            .getQueue();

    IQueue indexingUserQueue =
        new QueueConstruct(
                this, "IndexingUserQueueResource", new CustomQueueProps("SearchQueue", true), props)
            .getQueue();

    TopicConstruct topic =
        new TopicConstruct(this, "TopicResource", new CustomTopicProps("UserCreatedTopic"), props);

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
                .volumeSize(8)
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
                .build()));

    ComputerConstruct indexingComputer =
        new ComputerConstruct(
            this,
            "IndexingComputerResource",
            ComputerProps.builder()
                .bootstrapScript("./indexing-webserver-startup.sh")
                .vpc(vpc)
                .instanceName("indexing-webserver")
                .enableKeyPair(true)
                .allowSSHConnection(true)
                .volumeSize(8)
                .build(),
            props);

    indexingComputer.addPolicyToComputer(
        PolicyStatement.Builder.create()
            .effect(Effect.ALLOW)
            .sid("AllowInstanceToReceiveSQSMessage")
            .actions(
                List.of(
                    "sqs:DeleteMessage",
                    "sqs:ReceiveMessage",
                    "sqs:GetQueueAttributes",
                    "sqs:GetQueueUrl"))
            .resources(List.of(indexingUserQueue.getQueueArn()))
            .build());
  }
}
