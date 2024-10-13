package com.nivekaa.aws100dayscodechallenge.day18.stacks;

import com.nivekaa.aws100dayscodechallenge.day18.constructs.ComputerConstruct;
import com.nivekaa.aws100dayscodechallenge.day18.constructs.ComputerProps;
import com.nivekaa.aws100dayscodechallenge.day18.constructs.NetworkContruct;
import java.util.List;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.IInstance;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.iam.Effect;
import software.amazon.awscdk.services.iam.PolicyStatement;
import software.amazon.awscdk.services.sns.*;
import software.amazon.awscdk.services.sns.subscriptions.UrlSubscription;
import software.amazon.awscdk.services.sns.subscriptions.UrlSubscriptionProps;
import software.constructs.Construct;

public class MyStack extends Stack {
  public MyStack(final Construct scope, final String id) {
    this(scope, id, null);
  }

  public MyStack(final Construct scope, final String id, final StackProps props) {
    super(scope, id, props);

    IVpc vpc = new NetworkContruct(this, "NetworkResource", props).getVpc();

    int port = 8089;
    String topicName = "example-topic-main";

    ITopic topic =
        new Topic(
            this, "TopicResource", TopicProps.builder().topicName(topicName).fifo(false).build());

    ComputerConstruct webserver =
        new ComputerConstruct(
            this, "ComputerResource", ComputerProps.builder().vpc(vpc).port(port).build(), props);
    IInstance instance = webserver.getComputer();

    topic.grantSubscribe(instance);

    webserver.addPolicyToComputer(
        PolicyStatement.Builder.create()
            .effect(Effect.ALLOW)
            .resources(List.of(topic.getTopicArn()))
            .actions(
                List.of(
                    "sns:ConfirmSubscription",
                    "sns:Subscribe",
                    "sns:GetTopicAttributes",
                    "sns:ListTopics"))
            .build());

    ITopicSubscription endpointSubscription =
        new UrlSubscription(
            "http://%s:%d/topics/%s"
                .formatted(instance.getInstancePublicDnsName(), port, topicName),
            UrlSubscriptionProps.builder()
                .rawMessageDelivery(false)
                .protocol(SubscriptionProtocol.HTTP)
                .build());

    topic.addSubscription(endpointSubscription);
  }
}
