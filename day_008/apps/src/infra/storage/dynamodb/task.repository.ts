import { AbstractRepository } from './abstract.repository'
import { Task } from '../../../../domain/task.domain'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { TodoListRepository } from './todo-list.repository'

export class TaskRepository implements AbstractRepository<Task> {
  private readonly todoRepo: TodoListRepository

  constructor(private client: DynamoDBDocumentClient, private tableName: string) {
    this.todoRepo = new TodoListRepository(client, tableName)
  }

  async create(toCreate: Task, idTodoList: string, todoName: string): Promise<Task> {
    const todo = await this.todoRepo.get({ pk: idTodoList, sk: todoName })
    const response = await this.client
    return Promise.resolve(null!)
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(false)
  }

  get(id: { pk: string; sk?: string }): Promise<Task | null> {
    return Promise.resolve(undefined!)
  }

  list(query: any): Promise<Task[]> {
    return Promise.resolve([])
  }

  update(id: { pk: string; sk?: string }, toUpdate: Task): Promise<Task> {
    return Promise.resolve(undefined!)
  }
}