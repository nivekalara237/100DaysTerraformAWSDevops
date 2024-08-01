import * as cdk from 'aws-cdk-lib'
import {
  Aws,
  aws_apigateway as api,
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  Duration
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { MediaType } from './apigw/media-type.enum'
import { ApiMethod } from './apigw/api-method.resource'
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs'
import { dependencies } from '../apps/package.json'

interface CustomStackProps extends cdk.StackProps {
  stage: string,
  // layerArn: string,
  tableName: string
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, props)

    const table = this.createDynamoDBTable(props)

    const lambdaFunction = this.createLambdaFunction(props, table.attrArn)

    const restApi = new api.CfnRestApi(this, 'ApiGatewayResource', {
      name: 'ApiGateway',
      apiKeySourceType: api.ApiKeySourceType.HEADER,
      disableExecuteApiEndpoint: false, // Will be defined to true when the Route 53 will be configured
      tags: [{ key: 'Name', value: 'Api Gateway' }],
      endpointConfiguration: {
        types: [api.EndpointType.REGIONAL]
      }
    })

    new lambda.CfnPermission(this, 'LambdaPermissionResource', {
      sourceAccount: props.env?.account,
      action: 'lambda:InvokeFunction',
      principal: 'apigateway.amazonaws.com',
      sourceArn: `arn:${Aws.PARTITION}:execute-api:${props.env?.region}:${props.env?.account}:${restApi.attrRestApiId}/*/*/*`,
      functionName: lambdaFunction.functionArn
    })

    lambdaFunction.addPermission('LambdaPermission', {
      action: 'lambda:InvokeFunction',
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceAccount: props.env?.account,
      sourceArn: 'arn:${Aws.PARTITION}:execute-api:${props.env?.region}:${props.env?.account}:${restApi.attrRestApiId}/*/*/*'
    })

    const {
      rootResource,
      getTodoListsResource,
      createTodoListResource,
      updateTodoListResource,
      deleteTodoListResource
    } = this.createResources(restApi)

    const getTodoListsMethod = new ApiMethod(this, 'ApiTodoListsMethodResource', {
      methodType: MediaType.GET,
      authType: api.AuthorizationType.NONE,
      restApiId: restApi.attrRestApiId,
      resourceId: getTodoListsResource.attrResourceId,
      operationName: 'GetAllTodoLists',
      integration: {
        connection: api.ConnectionType.INTERNET,
        type: api.IntegrationType.AWS_PROXY,
        httpMethod: MediaType.POST,
        uri: `arn:aws:apigateway:${props.env?.region}:lambda:path/2015-03-31/functions/${lambdaFunction.functionArn}/invocations`
      }
    }).resource

    const createTodoListMethod = new ApiMethod(this, 'ApiCreateTodoListResource', {
      methodType: MediaType.POST,
      authType: api.AuthorizationType.NONE,
      restApiId: restApi.attrRestApiId,
      resourceId: createTodoListResource.attrResourceId,
      operationName: 'CreateTodoList',
      integration: {
        connection: api.ConnectionType.INTERNET,
        type: api.IntegrationType.AWS_PROXY,
        httpMethod: MediaType.POST,
        uri: `arn:aws:apigateway:${props.env?.region}:lambda:path/2015-03-31/functions/${lambdaFunction.functionArn}/invocations`
      }
    }).resource

    const updateTodoListMethod = new ApiMethod(this, 'ApiUpdateTodoListResource', {
      methodType: MediaType.PUT,
      authType: api.AuthorizationType.NONE,
      restApiId: restApi.attrRestApiId,
      resourceId: updateTodoListResource.attrResourceId,
      operationName: 'UpdateTodoList',
      integration: {
        connection: api.ConnectionType.INTERNET,
        type: api.IntegrationType.AWS_PROXY,
        httpMethod: MediaType.POST,
        uri: `arn:aws:apigateway:${props.env?.region}:lambda:path/2015-03-31/functions/${lambdaFunction.functionArn}/invocations`
      },
      requestParams: {
        paths: ['todoListId']
      }
    }).resource

    const deleteTodoListMethod = new ApiMethod(this, 'ApiDeleteTodoListMethodResource', {
      methodType: MediaType.DELETE,
      authType: api.AuthorizationType.NONE,
      restApiId: restApi.attrRestApiId,
      resourceId: updateTodoListResource.attrResourceId,
      operationName: 'DeleteTodoList',
      integration: {
        connection: api.ConnectionType.INTERNET,
        type: api.IntegrationType.AWS_PROXY,
        httpMethod: MediaType.POST,
        uri: `arn:aws:apigateway:${props.env?.region}:lambda:path/2015-03-31/functions/${lambdaFunction.functionArn}/invocations`
      },
      requestParams: {
        paths: ['todoListId']
      }
    }).resource
    getTodoListsMethod.addDependency(restApi)
    createTodoListMethod.addDependency(restApi)
    getTodoListsMethod.addDependency(getTodoListsResource)
    createTodoListMethod.addDependency(createTodoListResource)
    updateTodoListMethod.addDependency(restApi)
    updateTodoListMethod.addDependency(updateTodoListResource)
    deleteTodoListMethod.addDependency(restApi)
    deleteTodoListMethod.addDependency(deleteTodoListResource)

    const apiDeployment = new api.CfnDeployment(this, 'ApiRestDeployment', {
      restApiId: restApi.attrRestApiId,
      stageName: props.stage
    })

    apiDeployment.addDependency(getTodoListsMethod)
    apiDeployment.addDependency(createTodoListMethod)
    apiDeployment.addDependency(deleteTodoListMethod)
    apiDeployment.addDependency(updateTodoListMethod)
    apiDeployment.addDependency(restApi)

  }

  private createResources(restApi: api.CfnRestApi) {
    const rootResource = new api.CfnResource(this, 'RestApiRootResource', {
      restApiId: restApi.attrRestApiId,
      parentId: restApi.attrRootResourceId,
      pathPart: 'todo-app-api'
    })

    const getTodoListsResource = new api.CfnResource(this, 'RestApiGetTodoListsResource', {
      restApiId: restApi.attrRestApiId,
      parentId: rootResource.attrResourceId,
      pathPart: 'todolists'
    })

    const createTodoListResource = new api.CfnResource(this, 'RestApiCreateTodoListResource', {
      restApiId: restApi.attrRestApiId,
      parentId: getTodoListsResource.attrResourceId,
      pathPart: 'create-todolist'
    })

    const pathVariableSegmentResource = new api.CfnResource(this, 'RestApiUpdateTodoListPathVariableResource', {
      restApiId: restApi.attrRestApiId,
      parentId: getTodoListsResource.attrResourceId,
      pathPart: '{todoListId}'
    })

    const updateTodoListLastSegmentResource = new api.CfnResource(this, 'RestApiUpdateTodoListResource', {
      restApiId: restApi.attrRestApiId,
      parentId: pathVariableSegmentResource.attrResourceId,
      pathPart: 'update-todolist'
    })

    const deleteTodoListLastSegmentResource = new api.CfnResource(this, 'RestApiDeleteTodoListResource', {
      restApiId: restApi.attrRestApiId,
      parentId: pathVariableSegmentResource.attrResourceId,
      pathPart: 'delete-todolist'
    })

    rootResource.addDependency(restApi)
    getTodoListsResource.addDependency(restApi)
    createTodoListResource.addDependency(restApi)
    pathVariableSegmentResource.addDependency(restApi)
    updateTodoListLastSegmentResource.addDependency(restApi)
    deleteTodoListLastSegmentResource.addDependency(restApi)

    return {
      rootResource,
      getTodoListsResource,
      createTodoListResource,
      updateTodoListResource: updateTodoListLastSegmentResource,
      deleteTodoListResource: deleteTodoListLastSegmentResource
    }
  }

  private createLambdaFunction(props: CustomStackProps, dynamodbTableArn: string) {

    const lambdaRole = new iam.Role(this, 'RoleResource', {
      roleName: 'lambdaRole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com', {
        region: props.env?.region
      }),
      path: '/',
      inlinePolicies: {
        logging: new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              actions: [
                'logs:CreateLogGroup',
                'logs:PutLogEvents',
                'logs:CreateLogStream'
              ],
              effect: iam.Effect.ALLOW,
              resources: ['*']
            })
          ]
        }),
        dynamodb: new iam.PolicyDocument({
          assignSids: true,
          statements: [
            new iam.PolicyStatement({
              actions: [
                'dynamodb:PutItem',
                'dynamodb:GetItem',
                'dynamodb:DeleteItem',
                'dynamodb:UpdateItem',
                'dynamodb:Scan',
                'dynamodb:Query'
              ],
              effect: iam.Effect.ALLOW,
              resources: [dynamodbTableArn]
            })
          ]
        })
      }
    })

    const layerArn = cdk.Fn.importValue('layerArn')

    return new NodejsFunction(this, 'LambdaResource', {
      // code: lambda.InlineCode.fromInline(""),
      entry: './apps/index.ts',
      handler: 'index.handler',
      timeout: Duration.seconds(10),
      functionName: 'Todo-App-NodejsFunction',
      environment: {
        TABLE_NAME: props.tableName
      },
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 128,
      role: lambdaRole,
      bundling: {
        externalModules: [
          ...Object.keys(dependencies),
          'utils'
        ],
        sourceMap: true,
        sourceMapMode: SourceMapMode.BOTH
      },
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(this, 'UtilsAndNodeModulesResource', layerArn)
      ]
    })
  }

  private createDynamoDBTable(props: CustomStackProps) {
    return new dynamodb.CfnTable(this, 'DynamoDBTableResource', {
      tableName: props.tableName,
      keySchema: [{
        keyType: 'HASH',
        attributeName: 'ID'
      }, {
        keyType: 'RANGE',
        attributeName: 'TodoName'
      }],
      attributeDefinitions: [{
        attributeName: 'ID',
        attributeType: dynamodb.AttributeType.STRING
      }, {
        attributeName: 'TodoName',
        attributeType: dynamodb.AttributeType.STRING
      }],
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableClass: dynamodb.TableClass.STANDARD,

      tags: [{
        key: 'Name',
        value: `DynamoDB-Table-${props.tableName}`
      }]
    })
  }
}
