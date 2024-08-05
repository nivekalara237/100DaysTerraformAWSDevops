import { APIGatewayProxyEvent } from 'aws-lambda'
import { isNull } from 'utils'
import { LambdaResponse } from './src/infra/dto/lambda.response'
import { TodoListRepository } from './src/infra/storage/dynamodb/todo-list.repository'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { AbstractRepository } from './src/infra/storage/dynamodb/abstract.repository'
import { TodoList } from './domain/todo-list.domain'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const tableName = <string>process.env.TABLE_NAME
const region = process.env.REGION ?? 'us-east-1'

const dynamodbClient = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: region
}))

export const handler = async (event: APIGatewayProxyEvent, context: any) => {
  const method = event.httpMethod
  const path = event.path
  console.log('incoming request', { ...event })
  if (isNull(method) && isNull(path)) {
    return {
      statusCode: 500,
      isBase64Encoded: false,
      body: JSON.stringify({
        message: 'Something wrong !!'
      })
    }
  }
  const repo: AbstractRepository<TodoList> = new TodoListRepository(dynamodbClient, tableName)
  const requestBody = (() => {
    if (event.isBase64Encoded) {
      return /* global atob */ atob(event.body!)
    }
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  })()
  let response: LambdaResponse
  if (method === 'POST' && path.endsWith('/create-todolist')) {
    // const existing = await repo.get?.()
    const result = await repo.create({
      name: requestBody.name,
      owner: {
        fullName: 'Kevin Lactio',
        email: 'kevin.kemta@amazonaws.com'
      }
    })
    response = {
      isBase64Encoded: false,
      statusCode: 200,
      body: JSON.stringify(result, null, -2)
    }
  } else if (path === '/todo-app-api/todolists') {
    const todos = await repo.list('')
    response = {
      isBase64Encoded: false,
      statusCode: 200,
      body: JSON.stringify(todos, null, -2)
    }
  } else if (new RegExp('^/todo-app-api/todolists/[a-z0-9-]{36}/update-todolist$', 'gi').test(path)) {
    const old = await repo.get?.({
      pk: event.pathParameters?.todoListId!,
      sk: requestBody.name
    })
    if (!old) {
      response = {
        isBase64Encoded: false,
        statusCode: 404,
        body: JSON.stringify({
          message: `The TodoList ${event.pathParameters?.todoListId!} doesn't exists`
        }, null, -2)
      }
    } else {
      const updated = await repo.update?.({ pk: old.id!, sk: old.name }, {
        name: requestBody.name ?? old.name,
        owner: {
          fullName: requestBody.owner?.fullName ?? old.owner?.fullName,
          email: requestBody.owner?.email ?? old.owner?.email
        }
      })
      response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify(updated, null, -2)
      }
    }
  } else {
    return {
      isBase64Encoded: false,
      statusCode: 403,
      body: JSON.stringify({
        message: `The API ${method} ${path} is no yet implemented in lambda side`
      }, null, -2)
    }
  }
  return {
    ...response,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }
}
