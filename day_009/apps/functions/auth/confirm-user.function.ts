import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda'
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
//@ts-ignore
import { computeSecretHash, responseError, responseOk, toPayload } from 'utils'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { SecretsManagerRepository } from '../../src/infra/storage/secrets/secrets-manager.repository'

const client = new CognitoIdentityProviderClient({
  runtime: ''
})

const sesClient = new SESClient()

const smClient = new SecretsManagerClient({
  region: process.env.REGION || 'us-east-1'
})

const CLIENT_ID = process.env.APP_CLIENT_ID
const SECRET_VALUE_ARN = process.env.SECRET_VALUE_ARN
const DOMAIN = process.env.DOMAIN

async function sendEmail(toEmail: string) {
  if (toEmail) {
    const command = new SendEmailCommand({
      Source: process.env.SES_VALIDATED_EMAIL,
      Destination: {
        ToAddresses: [toEmail]
      },
      Message: {
        Body: {
          Text: {
            Data: 'Your account has been confirmed!!'
          }
        },
        Subject: {
          Data: 'Todo-App: registration conpleted'
        }
      }
    })
    try {
      const res = await sesClient.send(command)
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }
}

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  const payload = toPayload(event)

  if (!validatePayload(payload)) {
    return responseError('Invalid input(s)', 403)
  }

  if (payload.hasOwnProperty('email') && payload.email && DOMAIN !== payload.email.split('@')[1]) {
    return responseError('The email is wrong.')
  } else {
    try {
      const clientSecret = await new SecretsManagerRepository(smClient)
        .getCognitoAppClientSecretValue(SECRET_VALUE_ARN!)
      const cmd = new ConfirmSignUpCommand({
        ConfirmationCode: payload.code + '',
        ClientId: CLIENT_ID,
        Username: payload.username,
        SecretHash: computeSecretHash(CLIENT_ID!, clientSecret, payload.username)
      })
      const response = await client.send(cmd)
      console.log(response)
      if (response.$metadata.httpStatusCode === 200) {
        await sendEmail(payload.email)
        return responseOk(null, 'Email confirmed')
      }

      return responseError('Something unexpected wrong!', response.$metadata.httpStatusCode)

    } catch (e) {
      console.error(e)
      return responseError(e.message)
    }
  }
}

const validatePayload = (payload: any): boolean => {
  return (payload.hasOwnProperty('username') && payload.hasOwnProperty('code'))
    && [payload.username, payload.code].every(value => !!value)
}