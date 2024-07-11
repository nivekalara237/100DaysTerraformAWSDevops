const {GetObjectCommand, PutObjectCommand, S3Client} = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {DynamoDBDocumentClient, PutCommand} = require("@aws-sdk/lib-dynamodb");
const UUID = require("uuid");

const region = process.env.REGION;
const thumbsDestBucket = process.env.THUMBS_BUCKET_NAME;
const picturesTableName = process.env.DYNAMODB_PICTURES_TABLE_NAME;
const thumbnailsTableName = process.env.DYNAMODB_THUMBNAILS_PICTURES_TABLE_NAME;
const s3Client = new S3Client({
    reqion: region,
});

const dynClient = new DynamoDBClient({
    region: region,
});
const documentClient = DynamoDBDocumentClient.from(dynClient);

const handler = async function (event, context) {
    const bucket = event.Records[0].s3.bucket.name;
    const objKey = decodeURIComponent(event.Records[0].s3.object.key.replace("/\+/g", " "));
    try {
        const originalObject = await s3Client.send(new GetObjectCommand({
            Bucket: bucket,
            Key: objKey
        }));
        console.log("Get S3 Object: [OK]");
        const imageBody = await originalObject.Body.transformToByteArray();
        const thumbs = await sharp(imageBody)
            .resize(128)
            .png()
            .toBuffer();
        console.log("Image resized: [OK]");
        await s3Client.send(new PutObjectCommand({
            Bucket: thumbsDestBucket,
            Key: objKey,
            Body: thumbs
        }));
        console.log("Put resized image into S3 bucket: [OK]");
        const itemPictureCommand = new PutCommand({
            TableName: picturesTableName,
            Item: {
                ID: UUID(),
                ObjectKey: objKey,
                BucketName: bucket,
                Region: region,
                CreatedAt: new Date().getTime(),
                FileSize: event.Records[0].s3.object.size
            }
        });

        await documentClient.send(itemPictureCommand);

        console.log("Put original metadata into DynamoDB Table: [OK]");

        const itemThumbCommand = new PutCommand({
            TableName: thumbnailsTableName,
            Item: {
                ID: UUID(),
                ObjectKey: objKey,
                BucketName: thumbsDestBucket,
                Region: region,
                CreatedAt: new Date().getTime(),
                FileSize: thumbs.byteLength
            }
        });

        await documentClient.send(itemThumbCommand);
        console.log("Put resized metadata into DynamoDB Table: [OK]");

        return {
            statusCode: 200,
            body: JSON.stringify({
                object: `${bucket}/${objKey}`,
                thumbs: `${thumbsDestBucket}/${objKey}`
            })
        };
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        };
    }
};

module.exports = handler