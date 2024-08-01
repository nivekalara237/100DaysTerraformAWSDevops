import { TodoInteractor } from '../../core/interactor/todo.interactor'
import { Todo } from '../../core/domain/todo.domain'
import { Injectable, InjectionToken } from '@angular/core'
import moment from 'moment'
import { v4 } from 'uuid'
import { storage } from '../../utils/local.storage'

export const MEMORY_TODO_REPOSITORY = new InjectionToken<TodoInteractor>('Todo Http repository', {
  providedIn: 'root',
  factory: () => new TodoMemoryRepository()
})

@Injectable()
export class TodoMemoryRepository implements TodoInteractor {

  add(todoName: string): Todo {
    let todos = this.list()
    console.log(todoName, todos)
    if (todos.findIndex(value => todoName === value.name) !== -1) {
      throw new Error(`Todo "${todoName}" is already exists`)
    }
    const todo: Todo = {
      name: todoName,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      owner: {
        name: 'Kevin Kemta',
        email: 'kevinlactiokemta@gmail.com'
      },
      id: v4()
    }
    todos.push(todo)
    storage().setItem('todos', JSON.stringify(todos, null, -1))
    return todo
  }

  list(): Todo[] {
    let todos: Todo[] = []
    if (storage().getItem('todos')) {
      todos = <Todo[]>JSON.parse(storage().getItem('todos')!)
    }
    return todos
  }

  remove(todoID: string): boolean {
    let todos = this.list()
    const nwList = todos.filter(({ id }) => id !== todoID)
    storage().setItem('todos', JSON.stringify(nwList, null, -2))
    return nwList.length === todos.length
  }

}
