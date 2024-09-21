import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { SonarServerInfrastructureStack } from '../stacks/sonar-server-infrastructure.stack'

// example test. To run these tests, uncomment this file along with the
// example resource in lib/day_015-stack.ts
test('EC2 Instance Created', () => {
  const app = new cdk.App()
  // WHEN
  const stack = new SonarServerInfrastructureStack(app, 'MyTestStack', {
    cidr: '10.0.0.1/16',
    env: {
      region: 'fake',
      account: 'fake'
    }
  })
  // THEN
  const template = Template.fromStack(stack)

  template.hasResourceProperties('AWS::EC2::Instance', {
    VisibilityTimeout: 300
  })
})
