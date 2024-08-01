import { Construct } from 'constructs'
import { aws_apigateway as api, StackProps } from 'aws-cdk-lib'
import { MediaType } from './media-type.enum'

interface CustomMethodProps extends StackProps {
  restApiId: string;
  resourceId: string;
  methodType: MediaType;
  integration: {
    uri: string;
    connection: api.ConnectionType;
    httpMethod: MediaType
    type: api.IntegrationType
  };
  authType?: api.AuthorizationType,
  operationName?: string
  requestParams?: {
    queries?: string[]
    paths?: string[]
    headers?: string[]
  }
}

export class ApiMethod extends Construct {

  public readonly resource: api.CfnMethod

  constructor(scope: Construct, id: string, props: CustomMethodProps) {
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


    this.resource = new api.CfnMethod(this, 'ApiTodoListsMethodResource', {
      apiKeyRequired: false,
      restApiId: props.restApiId,
      resourceId: props.resourceId,
      httpMethod: props.methodType,
      operationName: props.operationName || new Crypto().randomUUID(),
      authorizationType: props.authType || api.AuthorizationType.NONE,
      integration: {
        connectionType: props.integration.connection,
        integrationHttpMethod: props.integration.httpMethod,
        type: props.integration.type,
        uri: props.integration.uri,
        integrationResponses: [{
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': '\'Content-Type,X-Amz-Date,Authorization,X-Api-key,X-Amz-Security-Token\'',
            'method.response.header.Access-Control-Allow-Methods': '\'GET,OPTIONS,POST,PUT\'',
            'method.response.header.Access-Control-Allow-Origin': '\'*\''
          }
        }, {
          statusCode: '500',
          responseParameters: integrationResParams
        }],
        requestParameters: integrationReqParams
      },
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true
        }
      }],
      requestParameters: params
    })

  }
}