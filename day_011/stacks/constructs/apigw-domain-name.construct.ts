import { Construct } from 'constructs'
import { CustomStackProps } from '../custom-stack.props'
import {
  aws_apigateway as api,
  aws_certificatemanager as acm,
  aws_route53 as route53,
  aws_route53_targets as targets,
  Duration,
  RemovalPolicy
} from 'aws-cdk-lib'
import { generateResourceID } from './utils'

// import { aws_certificatemanager as acm, aws_route53 as route53 } from "aws-cdk-lib"

interface ApiDomainNameProps extends CustomStackProps {
  apiDomain: string,
  api: api.RestApi,
  certificateArn: string
}

export class ApiDomainName extends Construct {
  constructor(scope: Construct, id: string, private props: ApiDomainNameProps) {
    super(scope, id)

    if (!props.domain) {
      throw new Error('The domain parameter must be specified as the "ApiDomainName" have instantiated')
    }

    if (!this.props.apiDomain.endsWith(props.domain)) {
      throw new Error(`The apiDomain parameter must be a subdomain of ${this.props.domain}`)
    }

    const existingCertificate = acm.Certificate.fromCertificateArn(this, `ApiDomainCertificate_${id}`, props.certificateArn)
    const domain = new api.DomainName(this, `CustomApiDomainName_${id}`, {
      domainName: props.apiDomain,
      certificate: existingCertificate,
      endpointType: api.EndpointType.EDGE,
      securityPolicy: api.SecurityPolicy.TLS_1_2,
      mapping: props.api
    })
    domain.node.addDependency(props.api)

    const hostedZone = route53.HostedZone.fromLookup(this, `HostedZoneLookup_${generateResourceID()}`, {
      domainName: props.domain
    })

    const a_record = new route53.ARecord(this, `A_Record_${id}`, {
      recordName: props.apiDomain.concat('.'),
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.ApiGatewayDomain(domain)),
      ttl: Duration.minutes(2),
      comment: `The Record “A“ to route traffic from subdomain ${props.apiDomain} to the api gateway #${props.api.restApiId}`,
      region: props.env?.region,
      deleteExisting: true
    })
    a_record.applyRemovalPolicy(RemovalPolicy.DESTROY)

  }
}