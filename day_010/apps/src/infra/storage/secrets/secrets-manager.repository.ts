import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export class SecretsManagerRepository {
  constructor(private client: SecretsManagerClient) {
  }

  getCognitoAppClientSecretValue = async (secretArn: string): Promise<string> => {
    const command = new GetSecretValueCommand({
      SecretId: secretArn
    })
    try {
      const response = await this.client.send(command)
      if (response.$metadata.httpStatusCode === 200) {
        const json = JSON.parse(response.SecretString!)
        return json.appClientSecret + ''
      }
    } catch (e) {
      console.error(e)
    }
    throw new Error('Technical error. Please Contact an administrator or try again later')
  }
}