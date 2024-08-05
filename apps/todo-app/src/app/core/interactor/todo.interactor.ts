import { Todo } from '../domain/todo.domain'
import { Observable } from 'rxjs'

export interface TodoInteractor {
  add(todoName: string): Observable<Todo>;

  remove(tododID: string): Observable<boolean>;

  list(): Observable<Todo[]>
}
