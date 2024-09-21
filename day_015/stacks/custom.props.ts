import { StackProps } from 'aws-cdk-lib'

export interface CustomProps extends StackProps {
  cidr: string
}