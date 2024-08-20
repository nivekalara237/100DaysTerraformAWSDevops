import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { APIGatewayAuthorizerResult, PolicyDocument } from 'aws-lambda'

const cognitoJwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  clientId: process.env.APP_CLIENT_ID
  // tokenUse: 'access'
})

export const handler = async (event: any): Promise<APIGatewayAuthorizerResult> => {

  console.log('Event', event)

  let token: string = event.headers['Authorization'] ?? ''
  const typeCognitoToken: string = event.headers['Cognito-Token-Type'] ?? 'access'
  if (token.startsWith('Bearer')) {
    token = token.substring(7, token.length)
  }

  try {
    // @ts-ignore
    const decodedJWT = await cognitoJwtVerifier.verify(token, { tokenUse: typeCognitoToken })
    const policy: PolicyDocument = {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: event.methodArn
      }]
    }

    const context = {
      username: 'kevink',
      role: 'ADMIN',
      'custom:tokenUse': decodedJWT.token_use
    }

    return {
      principalId: decodedJWT.sub,
      policyDocument: policy,
      context
    }
  } catch (e) {
    console.error(e)
    throw new Error('Unauthorized')
  }
}