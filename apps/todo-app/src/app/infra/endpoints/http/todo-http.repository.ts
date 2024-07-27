import { Injectable, InjectionToken } from '@angular/core'
import { TodoInteractor } from '../../../core/interactor/todo.interactor'
import { Todo } from '../../../core/domain/todo.domain'

export const HTTP_TODO_REPOSITORY = new InjectionToken<TodoInteractor>('Todo Http repository', {
  providedIn: 'root',
  factory: () => new TodoHttpRepository()
})

@Injectable()
export class TodoHttpRepository implements TodoInteractor {

  add(todoName: string): Todo {
    return undefined!
  }

  list(): Todo[] {
    return []
  }

  remove(todoID: string): boolean {
    return false
  }

}
