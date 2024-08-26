export interface BucketObjectDto {
  bucketName: string,
  objects: {
    key: string;
    size: number;
  }[]
}