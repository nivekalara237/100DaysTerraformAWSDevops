import {
  Aws,
  aws_apigateway as api,
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  CfnOutput,
  RemovalPolicy
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { MediaType } from './apigw/media-type.enum'
import { ApiMethod } from './apigw/api-method.resource'
import { dependencies } from '../apps/package.json'
import { randomUUID } from 'node:crypto'
import { CustomStackProps } from './custom-stack.props'
import { LambdaFunction } from './constructs/lambda.construct'
import { LambdaLayer } from './constructs/lambda-layer.construct'
import { Cognito } from './constructs/cognito.contruct'
import { BaseStack } from './base.stack'
import { ConnectionType } from 'aws-cdk-lib/aws-apigateway'


export class CdkStack extends BaseStack {
  constructor(scope: Construct, id: string, private props: CustomStackProps) {
    super(scope, id, props)

    const table = this.createDynamoDBTable(props)
    const restApi = new api.RestApi(this, 'RestApiGatewayResource', {
      restApiName: 'ApiGateway',
      endpointTypes: [api.EndpointType.REGIONAL],
      deploy: true,
      deployOptions: {
        stageName: props.stage
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'Access-Control-Allow-Credentials',
          'Access-Control-Allow-Headers',
          'Impersonating-User-Sub'
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: api.Cors.ALL_ORIGINS
      },
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY
    })

    const cognitoUserPool = new Cognito(this, 'CustomCognitoResource', {
      verificationEmailUrl: 'https://localhost:4200/auth/confirm-email',
      fromEmail: props.cognito?.verificationFromEmail!
    })

    const lambdaLayerVersion = new LambdaLayer(this, 'NodeModulesDependenciesLayerResource', {
      ...props,
      layerName: 'NodeModulesDependenciesLayer'
    })

    const lambdaFunction = this.createLambdaFunction(table.attrArn, restApi, lambdaLayerVersion.layerArn)

    const lambdaAuthorizer = new LambdaFunction(this, 'LambdaAuthorizer', {
      functionName: 'Authorizer',
      entryFunction: './apps/functions/auth/jwt-authorizer.function.ts',
      logged: true,
      role: {
        name: 'AuthorizerRole'
      },
      externalDeps: [
        ...Object.keys(dependencies)
      ],
      env: {
        APP_CLIENT_ID: cognitoUserPool.defaultAppClientId,
        USER_POOL_ID: cognitoUserPool.userPoolId,
        REGION: props.env?.region!
      },
      layersArns: [lambdaLayerVersion.layerArn]
    })

    const cognitoAuthorizer = new api.CognitoUserPoolsAuthorizer(this, 'AuthorizerResource', {
      authorizerName: 'todo-app-authorizer',
      cognitoUserPools: [cognitoUserPool.userPool],
      identitySource: api.IdentitySource.header('authorization')
    })

    const {
      getTodoListsResource,
      createTodoListResource,
      updateTodoListResource,
      deleteTodoListResource,
      auth
    } = this.createResources(restApi)

    const authsMethods = this.createAuthResource(
      restApi,
      auth,
      lambdaLayerVersion.layerArn,
      {
        secretArn: cognitoUserPool.secretValueArn,
        clientId: cognitoUserPool.defaultAppClientId,
        userPooId: cognitoUserPool.userPoolId,
        userPoolArn: cognitoUserPool.userPoolArn
      }
    )
    const methodResponses = [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Authorization': true,
        'method.response.header.Access-Control-Allow-Origin': true
      }
    }]

    const getTodoListsMethod = getTodoListsResource.addMethod(MediaType.GET, new api.LambdaIntegration(lambdaFunction.resource, {
      connectionType: ConnectionType.INTERNET,
      proxy: true
    }), {
      authorizationType: api.AuthorizationType.COGNITO,
      authorizer: cognitoAuthorizer,
      methodResponses
    })

    const createTodoListMethod = createTodoListResource.addMethod(MediaType.POST, new api.LambdaIntegration(lambdaFunction.resource, {
      proxy: true,
      connectionType: ConnectionType.INTERNET
    }), {
      authorizer: cognitoAuthorizer,
      authorizationType: api.AuthorizationType.COGNITO,
      methodResponses
    })
    const updateTodoListMethod = updateTodoListResource.addMethod(MediaType.PUT, new api.LambdaIntegration(lambdaFunction.resource, {
      proxy: true,
      connectionType: api.ConnectionType.INTERNET
    }), {
      authorizer: cognitoAuthorizer,
      authorizationType: api.AuthorizationType.COGNITO,
      methodResponses
    })
    const deleteTodoListMethod = deleteTodoListResource.addMethod(MediaType.DELETE, new api.LambdaIntegration(lambdaFunction.resource, {
      connectionType: api.ConnectionType.INTERNET,
      proxy: true
    }), {
      authorizer: cognitoAuthorizer,
      authorizationType: api.AuthorizationType.COGNITO,
      methodResponses
    })

    const apiDeployment = new api.Deployment(this, 'ApiRestDeployment', {
      api: restApi,
      stageName: props.stage
    })

    apiDeployment.node.addDependency(cognitoAuthorizer)
    apiDeployment.node.addDependency(restApi);

    [...Object.values(authsMethods),
      getTodoListsMethod,
      createTodoListMethod,
      deleteTodoListMethod,
      updateTodoListMethod
    ].forEach(value => apiDeployment._addMethodDependency(value))

    new CfnOutput(this, 'ApiGatewayUrlOutput', {
      value: restApi.url,
      key: 'ApiGatewayUrl'
    })
  }

  private createResources(restApi: api.RestApi) {
    const rootResource = restApi.root.addResource('todo-app-api')

    const authResource = restApi.root.addResource('auth')

    const cors: api.CorsOptions = {
      allowHeaders: api.Cors.DEFAULT_HEADERS,
      allowMethods: [MediaType.POST, MediaType.PUT, MediaType.DELETE],
      allowOrigins: api.Cors.ALL_ORIGINS
    }

    const getTodoListsResource = rootResource.addResource('todolists', {
      defaultCorsPreflightOptions: cors,
      defaultMethodOptions: {
        operationName: 'ListAllTodoLists'
      }
    })

    const createTodoListResource = getTodoListsResource.addResource('create-todolist', {
      defaultMethodOptions: {
        operationName: 'CreateTodoLists'
      },
      defaultCorsPreflightOptions: cors
    })

    const pathVariableSegmentResource = getTodoListsResource
      .addResource('{todoListId}')

    const updateTodoListLastSegmentResource = pathVariableSegmentResource
      .addResource('update-todolist', {
        defaultCorsPreflightOptions: cors,
        defaultMethodOptions: {
          operationName: 'UpdateTodoList'
        }
      })

    const deleteTodoListLastSegmentResource = pathVariableSegmentResource
      .addResource('delete-todolist', {
        defaultCorsPreflightOptions: cors,
        defaultMethodOptions: {
          operationName: 'DeleteTodoList'
        }
      })

    const loginResource = authResource.addResource('login', {
      defaultCorsPreflightOptions: cors
    })
    const registerResource = authResource.addResource('register', {
      defaultCorsPreflightOptions: cors
    })
    const resendConfirmationCodeResource = authResource.addResource('resend-confirmation-email')
    const confirmResource = authResource.addResource('confirm-email', {
      defaultCorsPreflightOptions: cors
    })

    return {
      rootResource,
      getTodoListsResource,
      createTodoListResource,
      updateTodoListResource: updateTodoListLastSegmentResource,
      deleteTodoListResource: deleteTodoListLastSegmentResource,
      auth: {
        loginResource,
        registerResource,
        confirmResource,
        resendConfirmationCodeResource
      }
    }
  }

  private createLambdaFunction(dynamodbTableArn: string, restApi: api.RestApi, layerArn: string) {
    const fun = new LambdaFunction(this, 'TodoLambdaFunctionResource', {
      functionName: 'Todo-App-NodejsFunction',
      entryFunction: './apps/functions/todo-app/index.ts',
      env: {
        TABLE_NAME: this.props.tableName,
        REGION: this.props.env?.region!
      },
      logged: true,
      role: {
        name: 'TodoLambdaRole',
        inlinePolicies: {
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
      },
      layersArns: [layerArn]
    })
    fun.grantApi(restApi)
    return fun
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

  private createAuthResource(restApi: api.RestApi, auth: {
    registerResource: api.Resource;
    loginResource: api.Resource;
    confirmResource: api.Resource,
    resendConfirmationCodeResource: api.Resource
  }, layerArn: string, cognito: {
    secretArn: string,
    userPoolArn: string, userPooId: string, clientId: string
  }) {

    const cognitoInlinePolicy = {
      cognito: new iam.PolicyDocument({
        assignSids: true,
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'cognito-idp:ConfirmDevice',
              'cognito-idp:ChangePassword',
              'cognito-idp:ConfirmForgotPassword',
              'cognito-idp:ChangePassword',
              'cognito-idp:ConfirmSignUp',
              'cognito-idp:ForgotPassword',
              'cognito-idp:GetUser',
              'cognito-idp:GetUserAttributeVerificationCode',
              'cognito-idp:ListUsers',
              'cognito-idp:SignUp',
              'cognito-idp:UpdateUserAttributes'
            ],
            resources: [
              cognito.userPoolArn
            ]
          })
        ]
      }),
      secret: new iam.PolicyDocument({
        assignSids: true,
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:GetSecretValue'],
            resources: [cognito.secretArn]
          })
        ]
      })
    }

    const loginFunction = new LambdaFunction(this, 'LoginFunction', {
      functionName: 'Auth-Cognito-Login-NodejsFunction',
      entryFunction: './apps/functions/auth/login.function.ts',
      env: {
        USER_POOL_ID: cognito.userPooId,
        SECRET_VALUE_ARN: cognito.secretArn,
        APP_CLIENT_ID: cognito.clientId,
        REGION: this.props.env?.region!
      },
      logged: true,
      role: {
        inlinePolicies: cognitoInlinePolicy
      },
      layersArns: [layerArn],
      externalDeps: Object.keys(dependencies)
    })

    const registerFunction = new LambdaFunction(this, 'RegistrationFunction', {
      functionName: 'Auth-Cognito-Register-NodejsFunction',
      entryFunction: './apps/functions/auth/register.function.ts',
      env: {
        USER_POOL_ID: cognito.userPooId,
        SECRET_VALUE_ARN: cognito.secretArn,
        APP_CLIENT_ID: cognito.clientId,
        REGION: this.props.env?.region!
      },
      role: {
        name: 'AuthRegistrationRole',
        inlinePolicies: cognitoInlinePolicy
      },
      layersArns: [layerArn],
      externalDeps: Object.keys(dependencies)
    })

    const confirmUserFunction = new LambdaFunction(this, 'ConfirmUserFunction', {
      functionName: 'Auth-Cognito-ConfirmUser-NodejsFunction',
      entryFunction: './apps/functions/auth/confirm-user.function.ts',
      env: {
        USER_POOL_ID: cognito.userPooId,
        SECRET_VALUE_ARN: cognito.secretArn,
        APP_CLIENT_ID: cognito.clientId,
        DOMAIN: this.props.cognito?.domain!,
        REGION: this.props.env?.region!
      },
      logged: true,
      role: {
        name: 'AuthConfirmRole',
        inlinePolicies: cognitoInlinePolicy
      },
      layersArns: [layerArn],
      externalDeps: Object.keys(dependencies)
    })

    const resendConfirmCodeFunction = new LambdaFunction(this, 'ResendConfirmCodeFunction', {
      functionName: 'Auth-Cognito-ResendConfirmCode-NodejsFunction',
      entryFunction: './apps/functions/auth/resend-confirm-code.function.ts',
      env: {
        USER_POOL_ID: cognito.userPooId,
        SECRET_VALUE_ARN: cognito.secretArn,
        APP_CLIENT_ID: cognito.clientId,
        REGION: this.props.env?.region!
      },
      role: {
        name: 'ResendConfirmCode',
        inlinePolicies: cognitoInlinePolicy
      },
      logged: true,
      layersArns: [layerArn],
      externalDeps: Object.keys(dependencies)
    })

    Array.of(loginFunction, registerFunction, confirmUserFunction, resendConfirmCodeFunction)
      .forEach(func => {
        func.resource.addPermission(`APIGW-Permission-${randomUUID()}`, {
          principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
          sourceArn: `arn:${Aws.PARTITION}:execute-api:${this.props.env?.region}:${this.props.env?.account}:${restApi.restApiId}/*/*/*`,
          sourceAccount: this.props.env?.account,
          scope: this,
          action: 'lambda:InvokeFunction'
        })
      })

    const methodResponses = [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Authorization': true,
        'method.response.header.Access-Control-Allow-Origin': true
      }
    }]

    const loginMethod = auth.loginResource.addMethod(MediaType.POST, new api.LambdaIntegration(loginFunction.resource, {
      proxy: true
    }), {
      authorizationType: api.AuthorizationType.NONE,
      methodResponses,
      requestModels: {
        'application/json': new api.Model(this, 'LoginModelResource', {
          restApi: restApi,
          contentType: 'application/json',
          modelName: 'LoginRequestModel',
          schema: {
            required: ['password', 'email'],
            dependencies: {
              'email': {
                type: api.JsonSchemaType.STRING
              },
              'password': {
                type: api.JsonSchemaType.STRING
              },
              'remember-me': {
                type: api.JsonSchemaType.BOOLEAN,
                'default': true
              }
            }
          }
        })
      }
    })
    const registerMethod = auth.registerResource.addMethod(MediaType.POST, new api.LambdaIntegration(registerFunction.resource, {
      proxy: true
    }), {
      authorizationType: api.AuthorizationType.NONE,
      requestModels: {
        'application/json': new api.Model(this, 'RegistrationModelResource', {
          restApi: restApi,
          contentType: 'application/json',
          modelName: 'RegisterRequestModel',
          schema: {
            required: ['password', 'email', 'firstName'],
            dependencies: {
              'email': {
                type: api.JsonSchemaType.STRING
              },
              'username': {
                type: api.JsonSchemaType.STRING
              },
              'password': {
                type: api.JsonSchemaType.STRING
              },
              'firstName': {
                type: api.JsonSchemaType.STRING
              },
              'lastName': {
                type: api.JsonSchemaType.STRING
              },
              'birthDate': {
                type: api.JsonSchemaType.STRING
              }
            }
          }
        })
      },
      methodResponses
    })

    const confirmUserMethod = auth.confirmResource.addMethod(MediaType.POST, new api.LambdaIntegration(confirmUserFunction.resource, {
      proxy: true
    }), {
      methodResponses,
      authorizationType: api.AuthorizationType.NONE
    })

    const resendConfirmationCodeMethod = new ApiMethod(this, 'AuthResendConfirmationCodeMethodResource', {
      methodType: MediaType.GET,
      authType: api.AuthorizationType.NONE,
      restApiId: restApi.restApiId,
      resourceId: auth.resendConfirmationCodeResource,
      operationName: 'AuthResendConfirmationCode',
      integration: {
        connection: api.ConnectionType.INTERNET,
        type: api.IntegrationType.AWS_PROXY,
        httpMethod: MediaType.POST,
        uri: `arn:aws:apigateway:${this.props.env?.region}:lambda:path/2015-03-31/functions/${resendConfirmCodeFunction.functionArn}/invocations`
      },
      requestModels: {
        'application/json': new api.Model(this, 'ResendConfirmationCodeModelResource', {
          restApi: restApi,
          contentType: 'application/json',
          modelName: 'ResendConfirmationCodeRequestModel',
          schema: {
            required: ['username'],
            dependencies: {
              'username': {
                type: api.JsonSchemaType.STRING
              }
            }
          }
        })
      }
    }).resource

    return {
      loginMethod,
      registerMethod,
      confirmUserMethod,
      resendConfirmationCodeMethod
    }
  }
}
