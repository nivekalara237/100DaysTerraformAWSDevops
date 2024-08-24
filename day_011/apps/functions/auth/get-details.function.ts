import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION || 'us-east-1'
})

const smClient = new SecretsManagerClient({
  region: process.env.REGION || 'us-east-1'
})

const CLIENT_ID = process.env.APP_CLIENT_ID
const SECRET_VALUE_ARN = process.env.SECRET_VALUE_ARN

const handler = async (event: APIGatewayProxyEvent, context: Context) => {

}