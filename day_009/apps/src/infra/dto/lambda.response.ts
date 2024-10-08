export interface LambdaResponse {
  isBase64Encoded: boolean,
  statusCode: number,
  body: string,
  headers?: Record<string, string>
}