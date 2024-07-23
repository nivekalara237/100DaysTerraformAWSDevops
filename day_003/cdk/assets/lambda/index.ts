import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as UUID } from 'uuid'
import Jimp from 'jimp'


const region = process.env.REGION || 'us-east-1'
const thumbsDestBucket = process.env.THUMBS_BUCKET_NAME
const picturesTableName = process.env.DYNAMODB_PICTURES_TABLE_NAME
const thumbnailsTableName = process.env.DYNAMODB_THUMBNAILS_PICTURES_TABLE_NAME
const s3Client = new S3Client({
  region
})

const dynClient = new DynamoDBClient({
  region: region
})
const documentClient = DynamoDBDocumentClient.from(dynClient)

export const handler = async (event: any, context: any) => {

  for (const _record of [...event.Records || []]) {
    const bucket = _record.s3.bucket.name
    const objKey = decodeURIComponent(_record.s3.object.key.replace('/\+/g', ' '))

    if (new RegExp('[\/.](jpeg|png|jpg|gif|svg|webp|bmp)$').test(objKey)) {
      try {
        const originalObject = await s3Client.send(new GetObjectCommand({
          Bucket: bucket,
          Key: objKey
        }))

        console.log('Get S3 Object: [OK]')
        const imageBody = await originalObject.Body?.transformToByteArray()

        const image = await Jimp.read(Buffer.from(imageBody!.buffer))
        const thumbnail = await image.resize(128, Jimp.AUTO)
          .getBufferAsync(Jimp.MIME_PNG)

        console.log('Image resized: [OK]')
        await s3Client.send(new PutObjectCommand({
          Bucket: thumbsDestBucket,
          Key: objKey,
          Body: thumbnail
        }))
        console.log('Put resized image into S3 bucket: [OK]')
        const itemPictureCommand = new PutCommand({
          TableName: picturesTableName,
          Item: {
            ID: UUID(),
            ObjectKey: objKey,
            BucketName: bucket,
            Region: region,
            CreatedAt: Math.floor(Date.now() / 1000),
            FileSize: _record.s3.object.size
          }
        })

        await documentClient.send(itemPictureCommand)

        console.log('Put original metadata into DynamoDB Table: [OK]')

        const itemThumbCommand = new PutCommand({
          TableName: thumbnailsTableName,
          Item: {
            ID: UUID(),
            ObjectKey: objKey,
            BucketName: thumbsDestBucket,
            Region: region,
            CreatedAt: Math.floor(Date.now() / 1000),
            FileSize: thumbnail.byteLength
          }
        })

        await documentClient.send(itemThumbCommand)
        console.log('Put resized metadata into DynamoDB Table: [OK]')
        console.debug({
          statusCode: 200,
          body: JSON.stringify({
            object: `${bucket}/${objKey}`,
            thumbs: `${thumbsDestBucket}/${objKey}`
          })
        })
      } catch (e) {
        console.log(e)
        console.debug({
          statusCode: 500,
          body: JSON.stringify(e)
        })
      }
    } else {
      console.log('The image is not of type supported:  jpeg, png, jpg, gif, svg, webp or bmp')
    }
  }

}