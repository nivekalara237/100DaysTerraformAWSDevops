#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {CdkStack} from '../lib/cdk-stack';

const app = new cdk.App();
new CdkStack(app, 'CdkDay003Stack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    picturesBucketName: "pictures-cdk-09js9d0b8dz00zej",
    thumbnailsBucketName: "thumbnails-pictures-cdk-09js9d0b8dz00zej",
    pictureTableName: "PicturesTable",
    thumbnailTableName: "ThumbnailsTable",
    tags: {
        Days: "003",
        Owner: "kevinlactiokemta@gmail.com",
        IaCTools: "terraform",
        Project: "100DaysIaCChalenge",
        Environment: "DEV"
    },
    stackName: "CdkDay003Stack",
    description: "This stack build an infrastructure that call lambda function " +
        "for every object putted in the bucket, then create a miniature image and " +
        "store the metadata of the image resized and the original image in two dynamodb " +
        "table each one."
});

app.synth({
    // validateOnSynthesis: true
});