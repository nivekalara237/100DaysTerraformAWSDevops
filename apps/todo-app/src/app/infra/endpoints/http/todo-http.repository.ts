import { inject, Injectable, InjectionToken } from '@angular/core'
import { TodoInteractor } from '../../../core/interactor/todo.interactor'
import { Todo } from '../../../core/domain/todo.domain'
import { HttpClient } from '@angular/common/http'
import { catchError, map, Observable } from 'rxjs'
import { TodoResponseDto } from './dto/todo-response.dto'
import { url } from './constants'

export const HTTP_TODO_REPOSITORY = new InjectionToken<TodoInteractor>('Todo Http repository', {
  providedIn: 'root',
  factory: () => new TodoHttpRepository()
})

@Injectable()
export class TodoHttpRepository implements TodoInteractor {

  private httpClient: HttpClient

  constructor() {
    this.httpClient = inject(HttpClient)
  }

  add(todoName: string): Observable<Todo> {
    return this.httpClient.post<TodoResponseDto>(url('/todolists/create-todolist'), {
      name: todoName
    }, {
      responseType: 'json',
      observe: 'body'
    }).pipe(
      catchError((e) => {
        throw e
      }),
      /*map(value => {
        if (value.status === 200) {
          return value.body!
        }
        throw 'Http Error: ' + value
      }),*/
      map(value => ({
        id: value.id,
        name: value.name,
        createdAt: value.createdAt,
        owner: {
          name: value.owner.fullName,
          email: value.owner.email
        }
      }))
    )
  }

  list(): Observable<Todo[]> {
    return this.httpClient.get<TodoResponseDto[]>(url('/todolists'), {
      responseType: 'json',
      observe: 'body'
    }).pipe(
      /*map(value => {
        console.log('DATA', value)
        if (value.status === 200) {
          return value.body!
        }
        throw 'Http Error: ' + value
      }),*/
      map(v => {
        return [...v].map(value => ({
          id: value?.id,
          name: value?.name,
          createdAt: value?.createdAt,
          owner: {
            name: value?.owner?.fullName,
            email: value?.owner?.email
          }
        }))
      }),
      catchError((e) => {
        throw e
      })
    )
  }

  remove(todoID: string): Observable<boolean> {
    return this.httpClient.delete<any>(url(`/todolists/${todoID}/delete-todolists`), {
      responseType: 'json',
      observe: 'body'
    })
      .pipe(
        map(value => value)
      )
  }

}
