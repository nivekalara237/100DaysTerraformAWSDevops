import moment from 'moment'
import { LambdaResponse } from '../src/infra/dto/lambda.response'
import { createHmac } from 'node:crypto'

export const DATE_FORMAT = 'YYYY-MM-DD'
export const TIME_FORMAT = 'HH:mm:ss'
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`

export const isNull = (value: any) => value === null

export const nowDate = () => moment().format(DATETIME_FORMAT)
export const toPayload = (event: any) => {
  if (!event.body) return {}
  return event.isBase64Encoded || typeof event.body === 'string' ? JSON.parse(event.body) : event.body
}
export const responseError = (message: string, status: number = 500): LambdaResponse => ({
  isBase64Encoded: false,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    message: message,
    error: true
  }, null, -2),
  statusCode: status
})

export const responseOk = (data?: any, message?: string, status: number = 200): LambdaResponse => ({
  isBase64Encoded: false,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    ...(data || {}),
    message: message,
    error: false
  }, null, -2),
  statusCode: status
})

export const computeSecretHash = (clientId: string, clientSecret: string, username: string): string => {
  const hasher = createHmac('sha256', clientSecret + '')
  hasher.update(`${username}${clientId}`)
  return hasher.digest('base64')
}
