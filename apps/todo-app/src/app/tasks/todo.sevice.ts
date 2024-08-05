import { Inject, Injectable } from '@angular/core'
import { map, Observable } from 'rxjs'
import { TodoDTO } from './model/todo.dto'
import { TodoInteractor } from '../core/interactor/todo.interactor'
import { domainsToDTOs, domainToDTO } from './todo.mapper'
import { HTTP_TODO_REPOSITORY } from '../infra/endpoints/http/todo-http.repository'

@Injectable({ providedIn: 'root' })
export class TodoSevice {
  constructor(@Inject(HTTP_TODO_REPOSITORY) private interactor: TodoInteractor) {
  }

  addTodo = (name: string): Observable<TodoDTO> => {
    if (!name && name.trim().length > 0) {
      throw new Error('The name must be defined')
    }
    const domain = this.interactor.add(name)
    return domain.pipe(
      map(value => domainToDTO(value))
    )
  }

  getAllTodos = (): Observable<TodoDTO[]> => {
    return this.interactor.list().pipe(
      map(domainsToDTOs)
    )
  }

  deleteTodo = (id: string): Observable<boolean> => {
    return this.interactor.remove(id)
  }
}
