import { Construct } from 'constructs'
import { aws_cognito as cognito, aws_secretsmanager as sm, Duration, RemovalPolicy, StackProps } from 'aws-cdk-lib'
import { LambdaFunction } from './lambda.construct'

interface CognitoProps extends StackProps {
  verificationEmailUrl: string,
  fromEmail: string
}

export class Cognito extends Construct {
  private readonly _defaultAppClientId: string
  private readonly _secretValueArn: string
  private readonly _userPoolArn: string
  private readonly _userPoolId: string
  private readonly _userPool: cognito.IUserPool

  constructor(scope: Construct, id: string, private props: CognitoProps) {
    super(scope, id)

    const stdRequired: cognito.StandardAttribute = {
      required: true
    }

    const userPool = new cognito.UserPool(this, 'CognitoUserPoolResource', {
      removalPolicy: RemovalPolicy.DESTROY,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userPoolName: 'awschallenge-day009-userpool',
      selfSignUpEnabled: true,
      userInvitation: {
        emailSubject: 'An account has been created for you',
        emailBody: 'Your Cognito account has been created by an admin. Here is your username: {username} and your temporary password: {####}'
      },
      userVerification: {
        emailSubject: 'Confirm your email',
        emailBody: `The verification link to your new account is ${props.verificationEmailUrl}?code={####}&username={username}`,
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      signInCaseSensitive: false,
      signInAliases: {
        email: true,
        username: true
      },
      autoVerify: {
        email: true,
        phone: true
      },
      keepOriginal: {
        email: true
      },
      standardAttributes: {
        email: { ...stdRequired, mutable: true }
      },

      customAttributes: {
        'domain': new cognito.StringAttribute(),
        'created_at': new cognito.StringAttribute(),
        'last_updated_at': new cognito.StringAttribute(),
        'verified_at': new cognito.StringAttribute(),
        'first_name': new cognito.StringAttribute(),
        'last_name': new cognito.StringAttribute()
      },
      passwordPolicy: {
        tempPasswordValidity: Duration.days(14),
        minLength: 6,
        requireDigits: true,
        requireUppercase: true,
        requireLowercase: true,
        requireSymbols: true
      },
      email: cognito.UserPoolEmail.withCognito(props.fromEmail)
    })

    userPool.addTrigger(cognito.UserPoolOperation.CUSTOM_MESSAGE, this.customEmailMessageLambda())

    const userPoolClient = userPool.addClient('todo-app-client', {
      authFlows: {
        userPassword: true,
        adminUserPassword: true,
        custom: true,
        userSrp: true
      },
      disableOAuth: true,
      preventUserExistenceErrors: true,
      generateSecret: true,
      userPoolClientName: 'Todo-App-Client',
      accessTokenValidity: Duration.minutes(30),
      idTokenValidity: Duration.minutes(30),
      refreshTokenValidity: Duration.days(30)
    })

    const resourceServer = new cognito.UserPoolResourceServer(this, 'UserPoolResourceServerResource', {
      userPoolResourceServerName: 'todolist-resource-server',
      identifier: 'todolist-resource-server',
      userPool: userPool,
      scopes: [{
        scopeName: 'todolists.GET',
        scopeDescription: 'List all Todo Lists'
      }, {
        scopeName: 'todolists-create.POST',
        scopeDescription: 'Create a Todo List'
      }]
    })

    resourceServer.applyRemovalPolicy(RemovalPolicy.DESTROY)

    const clientSecret = new sm.Secret(this, 'SecretManagerResource', {
      secretName: `${userPool.userPoolId}/${userPoolClient.userPoolClientId}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          appClientSecret: userPoolClient.userPoolClientSecret.unsafeUnwrap()
        }),
        generateStringKey: `${userPoolClient.userPoolClientName}-AppSecret`
      }
    })

    this._defaultAppClientId = userPoolClient.userPoolClientId
    this._secretValueArn = clientSecret.secretArn
    this._userPoolArn = userPool.userPoolArn
    this._userPoolId = userPool.userPoolId
    this._userPool = userPool
  }

  get defaultAppClientId() {
    return this._defaultAppClientId
  }

  get secretValueArn() {
    return this._secretValueArn
  }

  get userPoolArn() {
    return this._userPoolArn
  }

  get userPoolId() {
    return this._userPoolId
  }

  get userPool() {
    return this._userPool
  }

  customEmailMessageLambda = () => {
    return new LambdaFunction(this, 'CustomVerificationMessage', {
      functionName: 'CustomMessageFunction',
      entryFunction: './apps/functions/auth/custom-confirm-message.function.ts',
      env: {
        CONFIRM_URL: this.props.verificationEmailUrl
      },
      logged: true
    }).resource
  }
}