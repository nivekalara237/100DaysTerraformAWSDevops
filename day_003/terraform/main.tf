locals {
  dynamo_table_attrs = {
    ID        = "S"
    ObjectKey = "S"
  }
}

resource "aws_dynamodb_table" "pictures" {
  name         = "PictureTable"
  table_class  = "STANDARD"
  hash_key     = "ID"
  range_key    = "ObjectKey"
  // write_capacity = 1
  // read_capacity  = 2
  billing_mode = "PAY_PER_REQUEST"

  dynamic "attribute" {
    for_each = local.dynamo_table_attrs
    content {
      name = attribute.key
      type = attribute.value
    }
  }

  tags = {
    Name = "dynamodb:PictureTable"
  }
}

resource "aws_dynamodb_table" "thumbnails" {
  name         = "ThumbnailsTable"
  table_class  = "STANDARD"
  hash_key     = "ID"
  range_key    = "ObjectKey"
  billing_mode = "PAY_PER_REQUEST"

  dynamic "attribute" {
    for_each = local.dynamo_table_attrs
    content {
      name = attribute.key
      type = attribute.value
    }
  }

  tags = {
    Name = "dynamodb:ThumbnailsTable"
  }
}

resource "aws_s3_bucket" "pictures-bucket" {
  object_lock_enabled = false
  bucket              = "pictures-98djnz8j30vxwjh6eeo"
  force_destroy       = true

  tags = {
    Name = "PicturesBucket"
  }
}

resource "aws_s3_bucket" "pictures-thumbs" {
  object_lock_enabled = false
  bucket              = "pictures-98djnz8j30vxwjh6eeo-thumbs"
  force_destroy       = true

  tags = {
    Name = "PicturesThumbsBucket"
  }
}

resource "aws_s3_bucket_public_access_block" "private_access" {
  for_each = {
    pic = aws_s3_bucket.pictures-bucket.id,
    th  = aws_s3_bucket.pictures-thumbs.id
  }
  bucket                  = each.value
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_policy" "lambda_policy_for_s3_and_dyanmodb" {
  name        = "lambda-upload-object-and-put-item_policy"
  description = "The IAM policy to give right lambda to put object and put table's item"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:PutObjectAcl"
        ],
        Resource = [
          aws_s3_bucket.pictures-thumbs.arn,
          "${aws_s3_bucket.pictures-thumbs.arn}/*",
        ]
      },
      {
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:GetBucket"]
        Resource = [
          aws_s3_bucket.pictures-bucket.arn,
          "${aws_s3_bucket.pictures-bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action : ["dynamodb:PutItem"]
        Resource : [
          aws_dynamodb_table.pictures.arn,
          aws_dynamodb_table.thumbnails.arn
        ]
      }
    ]
  })
  path = "/"
  tags = {
    Name = "iam:policy:lambda-for-s3-and-dynamodb"
  }
}

## -- Lambda Function

data "aws_region" "current" {}

data "archive_file" "function" {
  output_path = "./assets/func.zip"
  type        = "zip"
  source_dir  = "./assets/lambda"
}

resource "aws_lambda_function" "performing_images_function" {
  function_name    = "performing-images-function"
  role             = aws_iam_role.for_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = "./assets/func.zip"
  source_code_hash = data.archive_file.function.output_base64sha256
  memory_size      = 128
  timeout          = 10

  timeouts {
    create = "30m"
    update = "40m"
    delete = "40m"
  }

  environment {
    variables = {
      TRIGGER_BUCKET_NAME                     = aws_s3_bucket.pictures-bucket.bucket
      THUMBS_BUCKET_NAME                      = aws_s3_bucket.pictures-thumbs.bucket
      REGION                                  = data.aws_region.current.name
      DYANMODB_THUMBNAILS_PICTURES_TABLE_NAME = aws_dynamodb_table.thumbnails.name
      DYANMODB_PICTURES_TABLE_NAME            = aws_dynamodb_table.pictures.name
    }
  }

  depends_on = [data.archive_file.function]

  tags = {
    Name = "Lambda:PerformingImages"
  }
}

##  --- Bucket notification

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type = "Service"
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "for_lambda" {
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  name               = "iam_role_for_lambda"

  tags = {
    Name = "IAM:Role:Lambda"
  }
}

resource "aws_iam_role_policy_attachment" "attach_policies_to_lambda_role" {
  policy_arn = aws_iam_policy.lambda_policy_for_s3_and_dyanmodb.arn
  role       = aws_iam_role.for_lambda.name
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromBucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.performing_images_function.arn
  source_arn    = aws_s3_bucket.pictures-bucket.arn
  principal     = "s3.amazonaws.com"
}

resource "aws_s3_bucket_notification" "object_created_event" {
  bucket = aws_s3_bucket.pictures-bucket.id

  lambda_function {
    events = ["s3:ObjectCreated:*"]
    // filter_suffix       = ".{png|jpeg}"
    lambda_function_arn = aws_lambda_function.performing_images_function.arn
  }

  depends_on = [aws_lambda_function.performing_images_function]
}