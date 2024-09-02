import { Construct } from 'constructs'
import {
  aws_certificatemanager as acm,
  aws_cloudfront as cf,
  aws_cloudfront_origins as origins,
  aws_route53 as route53,
  aws_s3 as s3,
  Duration,
  StackProps
} from 'aws-cdk-lib'

export interface WebsiteDistributionProps extends StackProps {
  websiteBucketName: string;
  mainDomain: string,
  acm: {
    certificateArn: string
  },
  distribution: {
    subDomain: string
  }
}


export class WebsiteDistribution extends Construct {

  private readonly _distributionUrl: string
  private readonly _distributionArn: string
  private readonly _viewersUrl: string

  constructor(scope: Construct, id: string, props: WebsiteDistributionProps) {
    super(scope, id)

    const bucket = s3.Bucket.fromBucketName(this, `BucketName_${id}`, props.websiteBucketName!)
    const certificate = acm.Certificate.fromCertificateArn(this, `Certificate_${id}`, props.acm?.certificateArn!)

    const cachePolicy = new cf.CachePolicy(this, `Cache-${id}-Policy`, {
      cachePolicyName: `Cache-${id}-Policy`,
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
      queryStringBehavior: cf.CacheQueryStringBehavior.all(),
      cookieBehavior: cf.CacheCookieBehavior.none(),
      defaultTtl: Duration.seconds(30),
      headerBehavior: cf.CacheHeaderBehavior.allowList(
        'Origin',
        'Accept',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
      )
    })
    const originRequestPolicy = new cf.OriginRequestPolicy(this, `Origin-Request-${id}-Policy`, {
      originRequestPolicyName: `Origin-Request-${id}-Policy`,
      queryStringBehavior: cf.CacheQueryStringBehavior.all(),
      cookieBehavior: cf.CacheCookieBehavior.none(),
      headerBehavior: cf.CacheHeaderBehavior.allowList(
        'Origin',
        'Accept',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
      )
    })
    const distribution = new cf.Distribution(this, `SSLCertificate_${id}`, {
      enabled: true,
      defaultBehavior: {
        origin: new origins.HttpOrigin(bucket.bucketWebsiteDomainName, {
          protocolPolicy: cf.OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
          httpsPort: 443,
          connectionTimeout: Duration.seconds(10)
        }),
        allowedMethods: cf.AllowedMethods.ALLOW_ALL,
        cachedMethods: cf.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy,
        originRequestPolicy
      },
      certificate,
      httpVersion: cf.HttpVersion.HTTP2,
      domainNames: [props.distribution?.subDomain].filter(value => !!value)
    })

    distribution.metric5xxErrorRate({
      label: `website-distribution-${id}-5xxError`,
      color: '#e93d1a'
    })

    const hostedZone = route53.HostedZone.fromLookup(this, `HostedZone_${id}`, {
      domainName: props.mainDomain!
    })

    const cnameRecord = new route53.CnameRecord(this, `DomainCNAME_${id}`, {
      recordName: props.distribution?.subDomain + '.',
      domainName: distribution.distributionDomainName,
      zone: hostedZone,
      deleteExisting: true,
      ttl: Duration.minutes(10),
      comment: `RecordSet to send traffic from ${props.distribution?.subDomain} to ${distribution.distributionDomainName}`
    })

    this._distributionUrl = distribution.distributionDomainName
    this._viewersUrl = cnameRecord.domainName
    this._distributionArn = `arn:aws:cloudfront::${props.env?.account}:distribution/${distribution.distributionId}`
  }

  get distributionArn(): string {
    return this._distributionArn
  }

  get distributionUrl(): string {
    return this._distributionUrl
  }

  get viewsUrl(): string {
    return this._viewersUrl
  }
}