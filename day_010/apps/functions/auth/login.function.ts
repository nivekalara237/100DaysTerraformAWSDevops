import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda'
// @ts-ignore
import { computeSecretHash, responseError, toPayload } from 'utils'
import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { SecretsManagerRepository } from '../../src/infra/storage/secrets/secrets-manager.repository'

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION || 'us-east-1'
})

const smClient = new SecretsManagerClient({
  region: process.env.REGION || 'us-east-1'
})

const CLIENT_ID = process.env.APP_CLIENT_ID
const SECRET_VALUE_ARN = process.env.SECRET_VALUE_ARN

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {

  const payload = toPayload(event)
  if (!validatePayload(payload)) {
    return responseError('Invalid input(s).', 403)
  }

  try {

    const clientSecret = await new SecretsManagerRepository(smClient)
      .getCognitoAppClientSecretValue(SECRET_VALUE_ARN!)

    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        SECRET_HASH: computeSecretHash(CLIENT_ID!, clientSecret, payload.username),
        USERNAME: payload.username,
        PASSWORD: payload.password
      },
      UserContextData: {
        IpAddress: event.requestContext?.identity?.sourceIp
      }
    })

    const response = await client.send(command)

    console.log(response)

    if (response.$metadata.httpStatusCode !== 200) {
      return responseError(`Something wrong!! Status=${response.$metadata.httpStatusCode}`)
    }
    return {
      isBase64Encoded: false,
      statusCode: 200,
      headers: {
        Authorization: `Bearer ${response.AuthenticationResult?.IdToken}`
      },
      body: JSON.stringify({
        message: 'user logged!!',
        idToken: response.AuthenticationResult?.IdToken,
        accessToken: response.AuthenticationResult?.AccessToken,
        tokenType: response.AuthenticationResult?.TokenType,
        expiredIn: response.AuthenticationResult?.ExpiresIn,
        refreshToken: response.AuthenticationResult?.RefreshToken
      })
    }
  } catch (e) {
    console.error(e)
    return responseError(e.message)
  }
}

const validatePayload = (payload: any): boolean => {
  return (payload.hasOwnProperty('username') && payload.hasOwnProperty('password'))
    && [payload.username, payload.password].every(value => !!value)
}
