"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiMethod = void 0;
const constructs_1 = require("constructs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class ApiMethod extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.resource = new aws_cdk_lib_1.aws_apigateway.CfnMethod(this, 'ApiTodoListsMethodResource', {
            apiKeyRequired: false,
            restApiId: props.restApiId,
            resourceId: props.resourceId,
            httpMethod: props.methodType,
            operationName: 'GET /todo-app-api/todolists',
            authorizationType: props.authType || aws_cdk_lib_1.aws_apigateway.AuthorizationType.NONE,
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
                        statusCode: '500'
                    }]
            },
            methodResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers': true,
                        'method.response.header.Access-Control-Allow-Methods': true,
                        'method.response.header.Access-Control-Allow-Origin': true
                    }
                }]
        });
    }
}
exports.ApiMethod = ApiMethod;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1ldGhvZC5yZXNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwaS1tZXRob2QucmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXNDO0FBQ3RDLDZDQUErRDtBQWdCL0QsTUFBYSxTQUFVLFNBQVEsc0JBQVM7SUFJdEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF3QjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSw0QkFBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUU7WUFDcEUsY0FBYyxFQUFFLEtBQUs7WUFDckIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO1lBQzFCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVU7WUFDNUIsYUFBYSxFQUFFLDZCQUE2QjtZQUM1QyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsUUFBUSxJQUFJLDRCQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSTtZQUMvRCxXQUFXLEVBQUU7Z0JBQ1gsY0FBYyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVTtnQkFDNUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVO2dCQUNuRCxJQUFJLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJO2dCQUM1QixHQUFHLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHO2dCQUMxQixvQkFBb0IsRUFBRSxDQUFDO3dCQUNyQixVQUFVLEVBQUUsS0FBSzt3QkFDakIsa0JBQWtCLEVBQUU7NEJBQ2xCLHFEQUFxRCxFQUFFLDBFQUEwRTs0QkFDakkscURBQXFELEVBQUUsMEJBQTBCOzRCQUNqRixvREFBb0QsRUFBRSxPQUFPO3lCQUM5RDtxQkFDRixFQUFFO3dCQUNELFVBQVUsRUFBRSxLQUFLO3FCQUNsQixDQUFDO2FBQ0g7WUFDRCxlQUFlLEVBQUUsQ0FBQztvQkFDaEIsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGtCQUFrQixFQUFFO3dCQUNsQixxREFBcUQsRUFBRSxJQUFJO3dCQUMzRCxxREFBcUQsRUFBRSxJQUFJO3dCQUMzRCxvREFBb0QsRUFBRSxJQUFJO3FCQUMzRDtpQkFDRixDQUFDO1NBQ0gsQ0FBQyxDQUFBO0lBRUosQ0FBQztDQUNGO0FBeENELDhCQXdDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnXG5pbXBvcnQgeyBhd3NfYXBpZ2F0ZXdheSBhcyBhcGksIFN0YWNrUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IE1lZGlhVHlwZSB9IGZyb20gJy4vbWVkaWEtdHlwZS5lbnVtJ1xuXG5pbnRlcmZhY2UgQ3VzdG9tTWV0aG9kUHJvcHMgZXh0ZW5kcyBTdGFja1Byb3BzIHtcbiAgcmVzdEFwaUlkOiBzdHJpbmc7XG4gIHJlc291cmNlSWQ6IHN0cmluZztcbiAgbWV0aG9kVHlwZTogTWVkaWFUeXBlO1xuICBpbnRlZ3JhdGlvbjoge1xuICAgIHVyaTogc3RyaW5nO1xuICAgIGNvbm5lY3Rpb246IGFwaS5Db25uZWN0aW9uVHlwZTtcbiAgICBodHRwTWV0aG9kOiBNZWRpYVR5cGVcbiAgICB0eXBlOiBhcGkuSW50ZWdyYXRpb25UeXBlXG4gIH07XG4gIGF1dGhUeXBlPzogYXBpLkF1dGhvcml6YXRpb25UeXBlXG59XG5cbmV4cG9ydCBjbGFzcyBBcGlNZXRob2QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuXG4gIHB1YmxpYyByZWFkb25seSByZXNvdXJjZTogYXBpLkNmbk1ldGhvZFxuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBDdXN0b21NZXRob2RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZClcbiAgICB0aGlzLnJlc291cmNlID0gbmV3IGFwaS5DZm5NZXRob2QodGhpcywgJ0FwaVRvZG9MaXN0c01ldGhvZFJlc291cmNlJywge1xuICAgICAgYXBpS2V5UmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgcmVzdEFwaUlkOiBwcm9wcy5yZXN0QXBpSWQsXG4gICAgICByZXNvdXJjZUlkOiBwcm9wcy5yZXNvdXJjZUlkLFxuICAgICAgaHR0cE1ldGhvZDogcHJvcHMubWV0aG9kVHlwZSxcbiAgICAgIG9wZXJhdGlvbk5hbWU6ICdHRVQgL3RvZG8tYXBwLWFwaS90b2RvbGlzdHMnLFxuICAgICAgYXV0aG9yaXphdGlvblR5cGU6IHByb3BzLmF1dGhUeXBlIHx8IGFwaS5BdXRob3JpemF0aW9uVHlwZS5OT05FLFxuICAgICAgaW50ZWdyYXRpb246IHtcbiAgICAgICAgY29ubmVjdGlvblR5cGU6IHByb3BzLmludGVncmF0aW9uLmNvbm5lY3Rpb24sXG4gICAgICAgIGludGVncmF0aW9uSHR0cE1ldGhvZDogcHJvcHMuaW50ZWdyYXRpb24uaHR0cE1ldGhvZCxcbiAgICAgICAgdHlwZTogcHJvcHMuaW50ZWdyYXRpb24udHlwZSxcbiAgICAgICAgdXJpOiBwcm9wcy5pbnRlZ3JhdGlvbi51cmksXG4gICAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbe1xuICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxuICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdcXCdDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLWtleSxYLUFtei1TZWN1cml0eS1Ub2tlblxcJycsXG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1xcJ0dFVCxPUFRJT05TLFBPU1QsUFVUXFwnJyxcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICdcXCcqXFwnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgIHN0YXR1c0NvZGU6ICc1MDAnXG4gICAgICAgIH1dXG4gICAgICB9LFxuICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbe1xuICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IHRydWUsXG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWUsXG4gICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH0pXG5cbiAgfVxufSJdfQ==