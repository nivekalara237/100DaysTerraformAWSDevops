import { Callback, Context, Handler } from 'aws-lambda'
import { S3Client } from '@aws-sdk/client-s3'
import { ObjectRepository } from '../../src/infra/storage/s3/object.repository'

const client = new S3Client({
  region: process.env.REGION ?? 'us-east-1'
})

const repo = new ObjectRepository(client)

export const handler: Handler = async (event: {
  payload: { bucketName: string }
}, context: Context, callback: Callback) => {
  if (!event.payload?.bucketName) {
    callback(new Error('Invalid payload'))
  } else {
    try {
      const response = await repo.deepGetAllObjects(event.payload.bucketName)
      await repo.deleteBucketObjects(event.payload.bucketName, response.objects.map(value => value.key))
      callback(null, response)
    } catch (e) {
      callback(e, null)
    }
  }
}