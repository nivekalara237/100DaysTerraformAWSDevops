import { Construct } from 'constructs'
import { aws_s3 as s3, Duration, RemovalPolicy, StackProps } from 'aws-cdk-lib'

interface S3WbesiteProps extends StackProps {
  origins?: string[]
}

export class S3Website extends Construct {
  private readonly _bucket: s3.IBucket
  private readonly _baseSegment: string

  constructor(scope: Construct, id: string, props: S3WbesiteProps) {
    super(scope, id)

    const bucketName = 'coverage-visualizer-sws-o8stnnkqmos1v'
    const defSeg = 'co2visualizer'

    const wsBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: bucketName,
      versioned: false,
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: true
      },
      objectLockEnabled: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      websiteIndexDocument: `index.html`,
      websiteErrorDocument: `error.html`,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY
    })
    wsBucket.addCorsRule({
      allowedMethods: [
        s3.HttpMethods.HEAD,
        s3.HttpMethods.GET
      ],
      allowedOrigins: props.origins || ['*'],
      maxAge: Duration.minutes(5).toSeconds()
    })

    wsBucket.addLifecycleRule({
      enabled: true,
      expiration: Duration.days(90),
      transitions: [{
        storageClass: s3.StorageClass.INFREQUENT_ACCESS,
        transitionAfter: Duration.days(30)
      }]
    })

    this._bucket = wsBucket
    this._baseSegment = defSeg
  }

  get bucket() {
    return this._bucket
  }

  get baseSegment() {
    return this._baseSegment
  }
}