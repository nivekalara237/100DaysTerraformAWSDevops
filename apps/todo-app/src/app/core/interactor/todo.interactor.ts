import { Todo } from '../domain/todo.domain'

export interface TodoInteractor {
  add(todoName: string): Todo;

  remove(tododID: string): boolean;

  list(): Todo[]
}
