import { Construct } from 'constructs'
import { aws_apigateway as api, StackProps } from 'aws-cdk-lib'
import { MediaType } from './media-type.enum'

interface CustomMethodProps extends StackProps {
  restApiId: string;
  resourceId: string | api.Resource;
  methodType: MediaType;
  integration: {
    template?: {
      request?: Record<string, string>
      response?: Record<string, string>
    };
    uri: string;
    connection: api.ConnectionType;
    httpMethod: MediaType
    type: api.IntegrationType,
    requestTemplate?: string
  };
  authType?: api.AuthorizationType,
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

    const reqModels = props.requestModels || {}
    const resModels = props.requestModels || {}

    this.resource = new api.Method(this, id, {
      httpMethod: props.methodType,
      resource: <api.Resource>props.resourceId,
      integration: new api.Integration({
        type: props.integration.type,
        integrationHttpMethod: props.integration.httpMethod,
        uri: props.integration.uri,
        options: {
          connectionType: props.integration.connection,
          integrationResponses: [{
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': '\'Content-Type,X-Amz-Date,Authorization,X-Api-key,X-Amz-Security-Token\'',
              'method.response.header.Access-Control-Allow-Methods': '\'GET,OPTIONS,POST,PUT\'',
              'method.response.header.Access-Control-Allow-Origin': '\'*\''
            }
          }, {
            statusCode: '500',
            responseParameters: integrationResParams,
            responseTemplates: props.integration?.template?.response || {}
          }],
          requestParameters: integrationReqParams,
          requestTemplates: props.integration?.template?.request || {}
        }
      }),
      options: {
        requestParameters: params,
        methodResponses: [
          {
            statusCode: '200',
            responseModels: resModels,
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Origin': true
            }
          }
        ],
        authorizationType: props.authType,
        operationName: (<api.Resource>props.resourceId).defaultMethodOptions?.operationName ?? props.operationName,
        requestModels: reqModels
      }
    })
    /*= new api.CfnMethod(this, 'ApiTodoListsMethodResource', {
    apiKeyRequired: false,
    restApiId: props.restApiId,
    resourceId: <string>props.resourceId,
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
      },
        {
          statusCode: '500',
          responseParameters: integrationResParams,
          responseTemplates: props.integration?.template?.response || {}
        }],
      requestParameters: integrationReqParams,
      requestTemplates: props.integration?.template?.request || {}
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
  })*/
  }
}