#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {CdkStack} from '../lib/cdk-stack';

const app = new cdk.App();
new CdkStack(app, 'Day1ChallengeCdkStack', {
    cidrVpc: "10.0.0.0/16",
    cidrVpcInternet: "0.0.0.0/0",
    keyName: "day1kp",
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    stackName: "Day1-challenge-cdk-stack",
    tags: {
        Environment: "DEV",
        Project: "100DaysIaCChalenge",
        IaCTools: "CDK",
        Owner: "kevinlactiokemta@gmail.com",
        Days: "001",
    }
});

app.synth();