package com.nivekaa.aws100dayscodechallenge.day17.stacks;

import com.nivekaa.aws100dayscodechallenge.day17.constructs.ComputerConstruct;
import com.nivekaa.aws100dayscodechallenge.day17.constructs.ComputerProps;
import com.nivekaa.aws100dayscodechallenge.day17.constructs.NetworkContruct;
import com.nivekaa.aws100dayscodechallenge.day17.constructs.QueueConstruct;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.IInstance;
import software.amazon.awscdk.services.ec2.IVpc;
import software.amazon.awscdk.services.sqs.IQueue;
import software.constructs.Construct;

public class MyStack extends Stack {
  public MyStack(final Construct scope, final String id) {
    this(scope, id, null);
  }

  public MyStack(final Construct scope, final String id, final StackProps props) {
    super(scope, id, props);

    IVpc vpc = new NetworkContruct(this, "NetworkResource", props).getVpc();

    IQueue queue = new QueueConstruct(this, "QueueResource", vpc, props).getQueue();

    IInstance webserver =
        new ComputerConstruct(
                this, "ComputerResource", new ComputerProps(vpc, queue.getQueueArn()), props)
            .getComputer();
  }
}
