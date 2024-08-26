import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda'
import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider'
//@ts-ignore
import { computeSecretHash, responseError, responseOk, toPayload } from 'utils'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { SecretsManagerRepository } from '../../src/infra/storage/secrets/secrets-manager.repository'

const client = new CognitoIdentityProviderClient({})
const smClient = new SecretsManagerClient({
  region: process.env.REGION || 'us-east-1'
})

const CLIENT_ID = process.env.APP_CLIENT_ID
const SECRET_VALUE_ARN = process.env.SECRET_VALUE_ARN

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  const payload = toPayload(event)

  if (!validatePayload(payload)) {
    return responseError('Invalid input(s)', 403)
  }
  try {
    const clientSecret = await new SecretsManagerRepository(smClient)
      .getCognitoAppClientSecretValue(SECRET_VALUE_ARN!)
    const command = new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: payload.username,
      SecretHash: computeSecretHash(CLIENT_ID, clientSecret, payload.username)
    })
    const response = await client.send(command)
    if (response.$metadata.httpStatusCode === 200) {
      return responseOk(null, 'Email resent!!')
    }
    return responseError('Something unexpected wrong!', response.$metadata.httpStatusCode)
  } catch (e) {
    console.error(e)
    return responseError(e.message)
  }
}

const validatePayload = (payload: any): boolean => {
  return (payload.hasOwnProperty('username') && !!payload.username)
}