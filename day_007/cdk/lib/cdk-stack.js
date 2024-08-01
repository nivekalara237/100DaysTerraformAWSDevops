"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const fs = require("node:fs");
const media_type_enum_1 = require("./apigw/media-type.enum");
const api_method_resource_1 = require("./apigw/api-method.resource");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
class CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const lambdaFunction = this.createLambdaFunction(props);
        const restApi = new aws_cdk_lib_1.aws_apigateway.CfnRestApi(this, 'ApiGatewayResource', {
            name: 'ApiGateway',
            apiKeySourceType: aws_cdk_lib_1.aws_apigateway.ApiKeySourceType.HEADER,
            disableExecuteApiEndpoint: false, // Will be defined to true when the Route 53 will be configured
            tags: [{ key: 'Name', value: 'Api Gateway' }],
            endpointConfiguration: {
                types: [aws_cdk_lib_1.aws_apigateway.EndpointType.REGIONAL]
            }
        });
        new aws_cdk_lib_1.aws_lambda.CfnPermission(this, 'LambdaPermissionResource', {
            sourceAccount: props.env?.account,
            action: 'lambda:InvokeFunction',
            principal: 'apigateway.amazonaws.com',
            sourceArn: `arn:${aws_cdk_lib_1.Aws.PARTITION}:execute-api:${props.env?.region}:${props.env?.account}:${restApi.attrRestApiId}/*/*/*`,
            functionName: lambdaFunction.functionArn
        });
        const { rootResource, getTodoListsResource } = this.createResources(restApi);
        const getTodoListsMethod = new api_method_resource_1.ApiMethod(this, 'ApiTodoListsMethodResource', {
            methodType: media_type_enum_1.MediaType.GET,
            authType: aws_apigateway_1.AuthorizationType.NONE,
            restApiId: restApi.attrRestApiId,
            resourceId: getTodoListsResource.attrResourceId,
            integration: {
                connection: aws_apigateway_1.ConnectionType.INTERNET,
                type: aws_apigateway_1.IntegrationType.AWS_PROXY,
                httpMethod: media_type_enum_1.MediaType.POST,
                uri: `arn:aws:apigateway:${props.env?.region}:lambda:path/2015-03-31/functions/${lambdaFunction.functionArn}/invocations`
            }
        }).resource;
        const createTodoListMethod = new api_method_resource_1.ApiMethod(this, 'ApiCreateTodoListResource', {
            methodType: media_type_enum_1.MediaType.POST,
            authType: aws_apigateway_1.AuthorizationType.NONE,
            restApiId: restApi.attrRestApiId,
            resourceId: getTodoListsResource.attrResourceId,
            integration: {
                connection: aws_apigateway_1.ConnectionType.INTERNET,
                type: aws_apigateway_1.IntegrationType.AWS_PROXY,
                httpMethod: media_type_enum_1.MediaType.POST,
                uri: `arn:aws:apigateway:${props.env?.region}:lambda:path/2015-03-31/functions/${lambdaFunction.functionArn}/invocations`
            }
        }).resource;
        getTodoListsMethod.addDependency(restApi);
        createTodoListMethod.addDependency(restApi);
        getTodoListsMethod.addDependency(getTodoListsResource);
        createTodoListMethod.addDependency(getTodoListsResource);
        const getTodoListsDeployement = new aws_cdk_lib_1.aws_apigateway.CfnDeployment(this, 'ApiTodoListsDeployement', {
            restApiId: restApi.attrRestApiId,
            stageName: props.stage
        });
        getTodoListsDeployement.addDependency(getTodoListsMethod);
        getTodoListsDeployement.addDependency(createTodoListMethod);
        getTodoListsDeployement.addDependency(restApi);
    }
    createResources(restApi) {
        const rootResource = new aws_cdk_lib_1.aws_apigateway.CfnResource(this, 'RestApiRootResource', {
            restApiId: restApi.attrRestApiId,
            parentId: restApi.attrRootResourceId,
            pathPart: 'todo-app-api'
        });
        const getTodoListsResource = new aws_cdk_lib_1.aws_apigateway.CfnResource(this, 'RestApiGetTodoListsResource', {
            restApiId: restApi.attrRestApiId,
            parentId: rootResource.attrResourceId,
            pathPart: 'todolists'
        });
        rootResource.addDependency(restApi);
        getTodoListsResource.addDependency(restApi);
        return {
            rootResource,
            getTodoListsResource
        };
    }
    createLambdaFunction(props) {
        const lambdaRole = new aws_cdk_lib_1.aws_iam.Role(this, 'RoleResource', {
            roleName: 'lambdaRole',
            assumedBy: new aws_cdk_lib_1.aws_iam.ServicePrincipal('lambda.amazonaws.com', {
                region: props.env?.region
            }),
            path: '/',
            inlinePolicies: {
                logging: new aws_cdk_lib_1.aws_iam.PolicyDocument({
                    assignSids: true,
                    statements: [
                        new aws_cdk_lib_1.aws_iam.PolicyStatement({
                            actions: [
                                'logs:CreateLogGroup',
                                'logs:PutLogEvents',
                                'logs:CreateLogStream'
                            ],
                            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
                            resources: ['*']
                        })
                    ]
                })
            }
        });
        return new aws_cdk_lib_1.aws_lambda.Function(this, 'LambdaResource', {
            code: aws_cdk_lib_1.aws_lambda.InlineCode.fromInline(fs.readFileSync('./apps/index.js', 'utf8')),
            handler: 'index.handler',
            timeout: aws_cdk_lib_1.Duration.seconds(10),
            functionName: 'Todo-App-Function',
            environment: {
                TABLE_NAME: 'TodoAppTables'
            },
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            role: lambdaRole
        });
    }
}
exports.CdkStack = CdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFrQztBQUNsQyw2Q0FBd0c7QUFFeEcsOEJBQTZCO0FBQzdCLDZEQUFtRDtBQUNuRCxxRUFBdUQ7QUFDdkQsK0RBQStGO0FBTy9GLE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3JDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBdUI7UUFDL0QsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFdkIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRXZELE1BQU0sT0FBTyxHQUFHLElBQUksNEJBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQzdELElBQUksRUFBRSxZQUFZO1lBQ2xCLGdCQUFnQixFQUFFLDRCQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTTtZQUM3Qyx5QkFBeUIsRUFBRSxLQUFLLEVBQUUsK0RBQStEO1lBQ2pHLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUM7WUFDN0MscUJBQXFCLEVBQUU7Z0JBQ3JCLEtBQUssRUFBRSxDQUFDLDRCQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQzthQUNuQztTQUNGLENBQUMsQ0FBQTtRQUVGLElBQUksd0JBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFO1lBQ3pELGFBQWEsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLE9BQU87WUFDakMsTUFBTSxFQUFFLHVCQUF1QjtZQUMvQixTQUFTLEVBQUUsMEJBQTBCO1lBQ3JDLFNBQVMsRUFBRSxPQUFPLGlCQUFHLENBQUMsU0FBUyxnQkFBZ0IsS0FBSyxDQUFDLEdBQUcsRUFB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WUFDeEIsT0FBTyxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QixZQUFZLEVBQUUsbUJBQW1CO1lBQ2pDLFdBQVcsRUFBRTtnQkFDWCxVQUFVLEVBQUUsZUFBZTthQUM1QjtZQUNELE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLFVBQVU7U0FDakIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGO0FBaElELDRCQWdJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IEF3cywgYXdzX2FwaWdhdGV3YXkgYXMgYXBpLCBhd3NfaWFtIGFzIGlhbSwgYXdzX2xhbWJkYSBhcyBsYW1iZGEsIER1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJ1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnbm9kZTpmcydcbmltcG9ydCB7IE1lZGlhVHlwZSB9IGZyb20gJy4vYXBpZ3cvbWVkaWEtdHlwZS5lbnVtJ1xuaW1wb3J0IHsgQXBpTWV0aG9kIH0gZnJvbSAnLi9hcGlndy9hcGktbWV0aG9kLnJlc291cmNlJ1xuaW1wb3J0IHsgQXV0aG9yaXphdGlvblR5cGUsIENvbm5lY3Rpb25UeXBlLCBJbnRlZ3JhdGlvblR5cGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSdcblxuaW50ZXJmYWNlIEN1c3RvbVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIHN0YWdlOiBzdHJpbmcsXG4gIGxheWVyQXJuOiBzdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIENka1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEN1c3RvbVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXG4gICAgY29uc3QgbGFtYmRhRnVuY3Rpb24gPSB0aGlzLmNyZWF0ZUxhbWJkYUZ1bmN0aW9uKHByb3BzKVxuXG4gICAgY29uc3QgcmVzdEFwaSA9IG5ldyBhcGkuQ2ZuUmVzdEFwaSh0aGlzLCAnQXBpR2F0ZXdheVJlc291cmNlJywge1xuICAgICAgbmFtZTogJ0FwaUdhdGV3YXknLFxuICAgICAgYXBpS2V5U291cmNlVHlwZTogYXBpLkFwaUtleVNvdXJjZVR5cGUuSEVBREVSLFxuICAgICAgZGlzYWJsZUV4ZWN1dGVBcGlFbmRwb2ludDogZmFsc2UsIC8vIFdpbGwgYmUgZGVmaW5lZCB0byB0cnVlIHdoZW4gdGhlIFJvdXRlIDUzIHdpbGwgYmUgY29uZmlndXJlZFxuICAgICAgdGFnczogW3sga2V5OiAnTmFtZScsIHZhbHVlOiAnQXBpIEdhdGV3YXknIH1dLFxuICAgICAgZW5kcG9pbnRDb25maWd1cmF0aW9uOiB7XG4gICAgICAgIHR5cGVzOiBbYXBpLkVuZHBvaW50VHlwZS5SRUdJT05BTF1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgbmV3IGxhbWJkYS5DZm5QZXJtaXNzaW9uKHRoaXMsICdMYW1iZGFQZXJtaXNzaW9uUmVzb3VyY2UnLCB7XG4gICAgICBzb3VyY2VBY2NvdW50OiBwcm9wcy5lbnY/LmFjY291bnQsXG4gICAgICBhY3Rpb246ICdsYW1iZGE6SW52b2tlRnVuY3Rpb24nLFxuICAgICAgcHJpbmNpcGFsOiAnYXBpZ2F0ZXdheS5hbWF6b25hd3MuY29tJyxcbiAgICAgIHNvdXJjZUFybjogYGFybjoke0F3cy5QQVJUSVRJT059OmV4ZWN1dGUtYXBpOiR7cHJvcHMuZW52Py5yZWdpb259OiR7cHJvcHMuZW52Py5hY2NvdW50fToke3Jlc3RBcGkuYXR0clJlc3RBcGlJZH0vKi8qLypgLFxuICAgICAgZnVuY3Rpb25OYW1lOiBsYW1iZGFGdW5jdGlvbi5mdW5jdGlvbkFyblxuICAgIH0pXG5cbiAgICBjb25zdCB7IHJvb3RSZXNvdXJjZSwgZ2V0VG9kb0xpc3RzUmVzb3VyY2UgfSA9IHRoaXMuY3JlYXRlUmVzb3VyY2VzKHJlc3RBcGkpXG5cbiAgICBjb25zdCBnZXRUb2RvTGlzdHNNZXRob2QgPSBuZXcgQXBpTWV0aG9kKHRoaXMsICdBcGlUb2RvTGlzdHNNZXRob2RSZXNvdXJjZScsIHtcbiAgICAgIG1ldGhvZFR5cGU6IE1lZGlhVHlwZS5HRVQsXG4gICAgICBhdXRoVHlwZTogQXV0aG9yaXphdGlvblR5cGUuTk9ORSxcbiAgICAgIHJlc3RBcGlJZDogcmVzdEFwaS5hdHRyUmVzdEFwaUlkLFxuICAgICAgcmVzb3VyY2VJZDogZ2V0VG9kb0xpc3RzUmVzb3VyY2UuYXR0clJlc291cmNlSWQsXG4gICAgICBpbnRlZ3JhdGlvbjoge1xuICAgICAgICBjb25uZWN0aW9uOiBDb25uZWN0aW9uVHlwZS5JTlRFUk5FVCxcbiAgICAgICAgdHlwZTogSW50ZWdyYXRpb25UeXBlLkFXU19QUk9YWSxcbiAgICAgICAgaHR0cE1ldGhvZDogTWVkaWFUeXBlLlBPU1QsXG4gICAgICAgIHVyaTogYGFybjphd3M6YXBpZ2F0ZXdheToke3Byb3BzLmVudj8ucmVnaW9ufTpsYW1iZGE6cGF0aC8yMDE1LTAzLTMxL2Z1bmN0aW9ucy8ke2xhbWJkYUZ1bmN0aW9uLmZ1bmN0aW9uQXJufS9pbnZvY2F0aW9uc2BcbiAgICAgIH1cbiAgICB9KS5yZXNvdXJjZVxuXG4gICAgY29uc3QgY3JlYXRlVG9kb0xpc3RNZXRob2QgPSBuZXcgQXBpTWV0aG9kKHRoaXMsICdBcGlDcmVhdGVUb2RvTGlzdFJlc291cmNlJywge1xuICAgICAgbWV0aG9kVHlwZTogTWVkaWFUeXBlLlBPU1QsXG4gICAgICBhdXRoVHlwZTogQXV0aG9yaXphdGlvblR5cGUuTk9ORSxcbiAgICAgIHJlc3RBcGlJZDogcmVzdEFwaS5hdHRyUmVzdEFwaUlkLFxuICAgICAgcmVzb3VyY2VJZDogZ2V0VG9kb0xpc3RzUmVzb3VyY2UuYXR0clJlc291cmNlSWQsXG4gICAgICBpbnRlZ3JhdGlvbjoge1xuICAgICAgICBjb25uZWN0aW9uOiBDb25uZWN0aW9uVHlwZS5JTlRFUk5FVCxcbiAgICAgICAgdHlwZTogSW50ZWdyYXRpb25UeXBlLkFXU19QUk9YWSxcbiAgICAgICAgaHR0cE1ldGhvZDogTWVkaWFUeXBlLlBPU1QsXG4gICAgICAgIHVyaTogYGFybjphd3M6YXBpZ2F0ZXdheToke3Byb3BzLmVudj8ucmVnaW9ufTpsYW1iZGE6cGF0aC8yMDE1LTAzLTMxL2Z1bmN0aW9ucy8ke2xhbWJkYUZ1bmN0aW9uLmZ1bmN0aW9uQXJufS9pbnZvY2F0aW9uc2BcbiAgICAgIH1cbiAgICB9KS5yZXNvdXJjZVxuICAgIGdldFRvZG9MaXN0c01ldGhvZC5hZGREZXBlbmRlbmN5KHJlc3RBcGkpXG4gICAgY3JlYXRlVG9kb0xpc3RNZXRob2QuYWRkRGVwZW5kZW5jeShyZXN0QXBpKVxuICAgIGdldFRvZG9MaXN0c01ldGhvZC5hZGREZXBlbmRlbmN5KGdldFRvZG9MaXN0c1Jlc291cmNlKVxuICAgIGNyZWF0ZVRvZG9MaXN0TWV0aG9kLmFkZERlcGVuZGVuY3koZ2V0VG9kb0xpc3RzUmVzb3VyY2UpXG5cbiAgICBjb25zdCBnZXRUb2RvTGlzdHNEZXBsb3llbWVudCA9IG5ldyBhcGkuQ2ZuRGVwbG95bWVudCh0aGlzLCAnQXBpVG9kb0xpc3RzRGVwbG95ZW1lbnQnLCB7XG4gICAgICByZXN0QXBpSWQ6IHJlc3RBcGkuYXR0clJlc3RBcGlJZCxcbiAgICAgIHN0YWdlTmFtZTogcHJvcHMuc3RhZ2VcbiAgICB9KVxuXG4gICAgZ2V0VG9kb0xpc3RzRGVwbG95ZW1lbnQuYWRkRGVwZW5kZW5jeShnZXRUb2RvTGlzdHNNZXRob2QpXG4gICAgZ2V0VG9kb0xpc3RzRGVwbG95ZW1lbnQuYWRkRGVwZW5kZW5jeShjcmVhdGVUb2RvTGlzdE1ldGhvZClcbiAgICBnZXRUb2RvTGlzdHNEZXBsb3llbWVudC5hZGREZXBlbmRlbmN5KHJlc3RBcGkpXG5cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVzb3VyY2VzKHJlc3RBcGk6IGFwaS5DZm5SZXN0QXBpKSB7XG4gICAgY29uc3Qgcm9vdFJlc291cmNlID0gbmV3IGFwaS5DZm5SZXNvdXJjZSh0aGlzLCAnUmVzdEFwaVJvb3RSZXNvdXJjZScsIHtcbiAgICAgIHJlc3RBcGlJZDogcmVzdEFwaS5hdHRyUmVzdEFwaUlkLFxuICAgICAgcGFyZW50SWQ6IHJlc3RBcGkuYXR0clJvb3RSZXNvdXJjZUlkLFxuICAgICAgcGF0aFBhcnQ6ICd0b2RvLWFwcC1hcGknXG4gICAgfSlcblxuICAgIGNvbnN0IGdldFRvZG9MaXN0c1Jlc291cmNlID0gbmV3IGFwaS5DZm5SZXNvdXJjZSh0aGlzLCAnUmVzdEFwaUdldFRvZG9MaXN0c1Jlc291cmNlJywge1xuICAgICAgcmVzdEFwaUlkOiByZXN0QXBpLmF0dHJSZXN0QXBpSWQsXG4gICAgICBwYXJlbnRJZDogcm9vdFJlc291cmNlLmF0dHJSZXNvdXJjZUlkLFxuICAgICAgcGF0aFBhcnQ6ICd0b2RvbGlzdHMnXG4gICAgfSlcblxuICAgIHJvb3RSZXNvdXJjZS5hZGREZXBlbmRlbmN5KHJlc3RBcGkpXG4gICAgZ2V0VG9kb0xpc3RzUmVzb3VyY2UuYWRkRGVwZW5kZW5jeShyZXN0QXBpKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJvb3RSZXNvdXJjZSxcbiAgICAgIGdldFRvZG9MaXN0c1Jlc291cmNlXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVMYW1iZGFGdW5jdGlvbihwcm9wczogQ3VzdG9tU3RhY2tQcm9wcykge1xuXG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnUm9sZVJlc291cmNlJywge1xuICAgICAgcm9sZU5hbWU6ICdsYW1iZGFSb2xlJyxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEuYW1hem9uYXdzLmNvbScsIHtcbiAgICAgICAgcmVnaW9uOiBwcm9wcy5lbnY/LnJlZ2lvblxuICAgICAgfSksXG4gICAgICBwYXRoOiAnLycsXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICBsb2dnaW5nOiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcbiAgICAgICAgICBhc3NpZ25TaWRzOiB0cnVlLFxuICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ0dyb3VwJyxcbiAgICAgICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ1N0cmVhbSdcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0xhbWJkYVJlc291cmNlJywge1xuICAgICAgY29kZTogbGFtYmRhLklubGluZUNvZGUuZnJvbUlubGluZShmcy5yZWFkRmlsZVN5bmMoJy4vYXBwcy9pbmRleC5qcycsICd1dGY4JykpLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygxMCksXG4gICAgICBmdW5jdGlvbk5hbWU6ICdUb2RvLUFwcC1GdW5jdGlvbicsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBUQUJMRV9OQU1FOiAnVG9kb0FwcFRhYmxlcydcbiAgICAgIH0sXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICAgIG1lbW9yeVNpemU6IDEyOCxcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGVcbiAgICB9KVxuICB9XG59XG4iXX0=