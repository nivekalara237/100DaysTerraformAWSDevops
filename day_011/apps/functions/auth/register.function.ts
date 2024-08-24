import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda'
import { LambdaResponse } from '../../src/infra/dto/lambda.response'
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  SignUpCommandOutput
} from '@aws-sdk/client-cognito-identity-provider'
import moment from 'moment'
//@ts-ignore
import { computeSecretHash, DATETIME_FORMAT, responseError, responseOk, toPayload } from 'utils'
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
  let responseHandler: LambdaResponse
  if (!validatePayload(payload)) {
    responseHandler = responseError('some Input(s) are invalid', 403)
  } else {
    const attributes = [{
      Name: 'email',
      Value: payload.email
    }, {
      Name: 'custom:domain',
      Value: 'nivekaa.com'
    }, {
      Name: 'custom:first_name',
      Value: payload.firstName
    }, {
      Name: 'family_name',
      Value: payload.lastName
    }, {
      Name: 'given_name',
      Value: payload.firstName
    }, {
      Name: 'custom:last_name',
      Value: payload.lastName
    }, {
      Name: 'custom:created_at',
      Value: moment().format(DATETIME_FORMAT)
    }, {
      Name: 'custom:last_updated_at',
      Value: moment().format(DATETIME_FORMAT)
    }, {
      Name: 'name',
      Value: (!!payload.lastName || !!payload.firstName) ? `${payload.firstName} ${payload.lastName}`.trim() : null
    }]

    let messageError = null

    try {
      const clientSecret = await new SecretsManagerRepository(smClient)
        .getCognitoAppClientSecretValue(SECRET_VALUE_ARN!)
      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: payload.username,
        Password: payload.password,
        SecretHash: computeSecretHash(CLIENT_ID, clientSecret, payload.username),
        UserAttributes: attributes,
        UserContextData: {
          IpAddress: event.requestContext?.identity?.sourceIp
        }
      })

      const response: SignUpCommandOutput = await client.send(command)
      if (response.$metadata.httpStatusCode !== 200) {
        messageError = `Something wrong: StatusCode=${response.$metadata.httpStatusCode}`
      }
    } catch (e) {
      console.error(e)
      messageError = e.message
    }

    if (messageError !== null) {
      return responseError(messageError)
    } else {
      return responseOk({}, 'User successfully created')
    }
  }
  return responseHandler
}

const validatePayload = (body: any): boolean => {
  const email = body.email
  const password = body.password
  const username = body.username
  const areNotNull = [email, password, username].every(value => !!username)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPassword = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/.test(password)

  return areNotNull && isEmailValid && isValidPassword
}