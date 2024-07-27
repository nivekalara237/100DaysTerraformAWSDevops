import { Inject, Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { HttpResponse } from '@angular/common/http'
import { TodoDTO } from './model/todo.dto'
import { TodoInteractor } from '../core/interactor/todo.interactor'
import { domainToDTO } from './todo.mapper'
import { MEMORY_TODO_REPOSITORY } from '../infra/memory/todo-memory.repository'

@Injectable({ providedIn: 'root' })
export class TodoSevice {
  constructor(@Inject(MEMORY_TODO_REPOSITORY) private interactor: TodoInteractor) {
  }

  addTodo = (name: string): Observable<HttpResponse<TodoDTO>> => {
    const domain = this.interactor.add(name)
    return of(new HttpResponse<TodoDTO>({
      body: domainToDTO(domain),
      status: 201,
      statusText: 'CREATED'
    }))
  }

  getAllTodos = (): Observable<HttpResponse<TodoDTO[]>> => {
    return of(
      new HttpResponse<TodoDTO[]>({
        body: (this.interactor.list().map(domainToDTO)),
        status: 200,
        statusText: 'OK'
      })
    )
  }

  deleteTodo = (id: string): Observable<HttpResponse<boolean>> => {
    const deleted = this.interactor.remove(id)
    if (deleted) {
      return of(
        new HttpResponse<boolean>({
          body: true,
          status: 204,
          statusText: 'DELETED'
        })
      )
    }
    return of(
      new HttpResponse<boolean>({
        body: false,
        status: 204,
        statusText: 'NOT_FOUND'
      })
    )
  }
}
