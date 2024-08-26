import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  S3Client
} from '@aws-sdk/client-s3'
import { BucketObjectDto } from '../../dto/bucket-object.dto'

export class ObjectRepository {
  constructor(private client: S3Client) {
  }

  deepGetAllObjects = async (bucketName: string): Promise<BucketObjectDto> => {
    if (!bucketName) {
      throw new Error('The bucket name must not null')
    }
    const objects: { key: string, size: number }[] = []
    try {
      const objectsOutput: ListObjectsCommandOutput = await this.client.send(new ListObjectsCommand({
        Bucket: bucketName
      }))
      if (objectsOutput.$metadata.httpStatusCode === 200) {
        objectsOutput.Contents?.forEach(value => {
          if (value.Key) {
            objects.push({
              key: value.Key,
              size: value.Size!
            })
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
    return {
      bucketName,
      objects
    }
  }

  deleteObjectByKey = async (bucketName: string, key: string): Promise<boolean> => {
    if (!bucketName || !key) {
      throw new Error('The bucket name and key object must not be null')
    }
    try {
      const result: DeleteObjectCommandOutput = await this.client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: bucketName
      }))
      return result.$metadata.httpStatusCode === 200
    } catch (e) {
      console.error(e)
    }
    return false
  }

  deleteBucketObjects = async (bucketName: string, keys: string[]): Promise<boolean> => {
    if (!bucketName || !keys) {
      throw new Error('The bucket name and key object must not be null')
    }
    try {
      const result: DeleteObjectsCommandOutput = await this.client.send(new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: keys.map(value => ({ Key: value }))
        }
      }))
      console.log(result)
      return result.$metadata.httpStatusCode === 200
    } catch (e) {
      console.error(e)
    }
    return false
  }
}