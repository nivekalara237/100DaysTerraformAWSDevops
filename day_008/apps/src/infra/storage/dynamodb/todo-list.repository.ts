import { AbstractRepository } from './abstract.repository'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
  QueryCommandOutput,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb'
import { v4 } from 'uuid'
import moment from 'moment'
import { TodoList } from '../../../../domain/todo-list.domain'
import { PageRequest } from '../../dto/page.request'

export class TodoListRepository implements AbstractRepository<TodoList> {

  constructor(private client: DynamoDBDocumentClient, private tableName: string) {
  }

  async create({ name, owner }: TodoList): Promise<TodoList> {
    const item = {
      ID: v4(),
      CreatedAt: Math.floor((new Date().getTime()) / 1000),
      UpdatedAt: Math.floor((new Date().getTime()) / 1000),
      TodoName: name,
      Owner: {
        Fullname: owner?.fullName,
        Email: owner?.email
      }
    }
    let response: PutCommandOutput
    try {
      response = await this.client.send(new PutCommand({
        TableName: this.tableName,
        Item: item,
        ExpressionAttributeNames: {
          '#nameAttr': 'TodoName'
        },
        ExpressionAttributeValues: {
          ':nameValue': { 'S': name }
        },
        ConditionExpression: '#nameAttr <> :nameValue'
        // ConditionExpression: 'attribute_not_exists(ID) AND attribute_not_exists(TodoName)'
      }))
    } catch (e) {
      console.error(e)
      throw new Error('DataStorageException: ' + e.message)
    }

    console.log('PutCommandResponse', response)

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error('DataStorage: Something wrong, please try again')
    }
    return {
      id: item.ID,
      createdAt: this.convertTimestampToDate(item.CreatedAt),
      updatedAt: this.convertTimestampToDate(item.UpdatedAt),
      owner,
      name: item.TodoName
    }
  }

  async delete(id: string): Promise<boolean> {
    let response
    try {
      response = await this.client.send(new DeleteCommand({
        TableName: this.tableName,
        Key: { ID: id }
      }))
    } catch (e) {
      console.error(e)
      throw new Error('DataStorageException: ' + e.message)
    }

    console.log('DeleteCommandResponse', response)

    return response.$metadata.httpStatusCode === 200
  }

  async list(query: any): Promise<TodoList[]> {
    let response: QueryCommandOutput
    const config = <PageRequest>query
    try {
      response = await this.client.send(new ScanCommand({
        TableName: this.tableName,
        Limit: config?.limit || 25,
        Select: 'ALL_ATTRIBUTES'
      }))
    } catch (e) {
      console.error(e)
      throw new Error('DataStorageException: ' + e.message)
    }
    if (response.$metadata.httpStatusCode === 200 && response.Count! > 0) {
      return [...response.Items || []].map((value: any) => {
        return {
          id: value.ID,
          name: value.TodoName,
          createdAt: this.convertTimestampToDate(value.CreatedAt),
          updatedAt: this.convertTimestampToDate(value.UpdatedAt),
          owner: {
            fullName: value.Owner.Fullname,
            email: value.Owner.Email
          },
          tasks: value.Tasks!
        }
      })
    }

    return []
  }

  async update(id: { pk: string, sk?: string }, toUpdate: TodoList): Promise<TodoList> {
    let response: PutCommandOutput
    const updateDate = Math.floor((new Date().getTime()) / 1000)
    try {
      response = await this.client.send(new UpdateCommand({
        TableName: this.tableName,
        Key: {
          ID: id.pk,
          TodoName: id.sk
        },
        UpdateExpression: 'SET #updateDate = :updatedAt, #owner.#email = :newOrOldEmail, #owner.#fullname = :newOrOldFullName',
        ExpressionAttributeNames: {
          // '#name': 'TodoName',
          '#updateDate': 'UpdatedAt',
          '#owner': 'Owner',
          '#fullname': 'FullName',
          '#email': 'Email'
        },
        ExpressionAttributeValues: {
          // ':newOrOldName': { 'S': toUpdate.name },
          ':updatedAt': updateDate,
          ':newOrOldEmail': toUpdate.owner?.email,
          ':newOrOldFullName': toUpdate.owner?.fullName
        },
        ReturnValues: 'ALL_NEW'
      }))
    } catch (e) {
      console.error(e)
      throw new Error('DataStorageException: ' + e.message)
    }

    console.debug('PutCommandOutput4Update', response)

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error('DataStorageException: something wrong during update !!')
    }

    return {
      ...toUpdate,
      id: id.pk,
      updatedAt: this.convertTimestampToDate(updateDate)
    }
  }

  async get(id: { pk: string, sk?: string }): Promise<TodoList | null> {
    let response: GetCommandOutput
    try {
      response = await this.client.send(new GetCommand({
        TableName: this.tableName,
        Key: {
          ID: id.pk,
          TodoName: id.sk
        }
      }))
    } catch (e) {
      console.error(e)
      throw new Error('DataStorageException: ' + e.message)
    }
    console.debug('GetCommandOutput', response)

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error('DataStorageException: something wrong during update !!')
    }

    const value: any = response.Item

    return !value ? null : {
      id: value.ID,
      name: value.TodoName,
      createdAt: this.convertTimestampToDate(value.CreatedAt),
      updatedAt: this.convertTimestampToDate(value.UpdatedAt),
      owner: {
        fullName: value.Owner.Fullname,
        email: value.Owner.Email
      },
      tasks: value.Tasks!
    }
  }

  private convertTimestampToDate = (time: number): string => moment.unix(time).format('YYYY-MM-DD HH:mm:ss')

}