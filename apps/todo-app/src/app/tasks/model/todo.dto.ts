import { Todo } from '../../core/domain/todo.domain'

export class TodoDTO implements Todo {
  public id?: string
  public owner?: {
    name: string,
    email: string
  }

  constructor(public name: string, public createdAt: string) {
  }
}
