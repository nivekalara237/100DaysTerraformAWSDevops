import { Construct } from 'constructs'
import { aws_apigateway as api, StackProps } from 'aws-cdk-lib'
import { MediaType } from './media-type.enum'
import { CognitoUserPoolsAuthorizer, IAuthorizer, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

interface CustomMethodProps extends StackProps {
  restApiId: string;
  resourceId: api.Resource;
  methodType: MediaType;
  integration: {
    lambdaHandler?: IFunction,
    template?: {
      request?: Record<string, string>
      response?: Record<string, string>
    };
    uri?: string;
    connection?: api.ConnectionType;
    httpMethod?: MediaType
    type?: api.IntegrationType,
    requestTemplate?: string
  };
  authType?: api.AuthorizationType,
  authorizer?: IAuthorizer,
  operationName?: string
  requestParams?: {
    queries?: string[]
    paths?: string[]
    headers?: string[]
  },
  requestModels?: Record<string, api.IModel>,
  responseModels?: Record<string, api.IModel>
}

export class ApiMethod extends Construct {
  public readonly resource: api.Method

  constructor(scope: Construct, id: string, private props: CustomMethodProps) {
    super(scope, id)
    const params = {} as Record<string, boolean>
    const integrationReqParams = {} as Record<string, string>
    const integrationResParams = {} as Record<string, string>
    if (props.requestParams?.paths) {
      props.requestParams.paths.forEach(value => {
        const p = `method.request.path.${value}`
        params[p] = true
        integrationReqParams[`integration.request.path.${value}`] = p
      })
    }

    if (props.requestParams?.queries) {
      props.requestParams.queries.forEach(value => {
        params[`method.request.queryString.${value}`] = true
        integrationReqParams[`integration.request.queryString.${value}`] = `method.request.queryString.${value}`
      })
    }

    if (props.requestParams?.headers) {
      props.requestParams.headers.forEach(value => {
        params[`method.request.header.${value}`] = true
        integrationReqParams[`integration.request.header.${value}`] = `method.request.header.${value}`
      })
    }

    const reqModels = props.requestModels || {}
    const resModels = props.requestModels || {}

    if (props.authType === api.AuthorizationType.COGNITO && !(props.authorizer instanceof CognitoUserPoolsAuthorizer)) {
      throw new Error('You had specified the Cognito as Auth Type, so your authorize must be @{CognitoUserPoolsAuthorizer}')
    }

    this.resource = new api.Method(this, id, {
      resource: <api.Resource>props.resourceId,
      httpMethod: props.methodType,
      options: {
        requestParameters: params,
        methodResponses: [
          {
            statusCode: '200',
            responseModels: resModels,
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Authorization': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Origin': true
            }
          }
        ],
        authorizationType: props.authType,
        authorizer: props.authorizer,
        requestModels: reqModels,
        operationName: (<api.Resource>props.resourceId).defaultMethodOptions?.operationName ?? props.operationName
      },
      integration: this.getIntegration(integrationResParams, integrationReqParams)
    })
  }

  private getIntegration = (integrationResParams: Record<string, string>, integrationReqParams: Record<string, string>) => {
    if (this.props.integration.lambdaHandler) {
      return new LambdaIntegration(this.props.integration.lambdaHandler!, {
        proxy: true,
        connectionType: this.props.integration.connection
      })
    } else {
      return new api.Integration({
        type: this.props.integration.type!,
        integrationHttpMethod: this.props.integration.httpMethod,
        uri: this.props.integration.uri,
        options: {
          connectionType: this.props.integration.connection,
          integrationResponses: [
            {
              statusCode: '200',
              contentHandling: api.ContentHandling.CONVERT_TO_TEXT,
              responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': '\'Content-Type,X-Amz-Date,Authorization,X-Api-key,X-Amz-Security-Token\'',
                'method.response.header.Access-Control-Allow-Methods': '\'GET,OPTIONS,POST,DELETE,PUT\'',
                'method.response.header.Access-Control-Allow-Origin': '\'*\''
              }
            },
            {
              statusCode: '500',
              responseParameters: integrationResParams,
              responseTemplates: this.props.integration?.template?.response || {}
            }],
          requestParameters: integrationReqParams,
          requestTemplates: this.props.integration?.template?.request || {}
        }
      })
    }
  }
}