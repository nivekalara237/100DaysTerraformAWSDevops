import { inject, Inject, InjectionToken } from '@angular/core'
import { TaskInteractor } from '../../../core/interactor/task.interactor'
import { HTTP_TODO_REPOSITORY, TodoHttpRepository } from './todo-http.repository'
import { TodoInteractor } from '../../../core/interactor/todo.interactor'
import { Observable } from 'rxjs'
import { Task } from '../../../core/domain/task.domain'
import { HttpClient } from '@angular/common/http'


export const HTTP_TASK_REPOSITORY = new InjectionToken<TaskInteractor>('Memory Task Repository', {
  providedIn: 'root',
  factory: () => new TaskHttpRepository(new TodoHttpRepository())
})

export class TaskHttpRepository implements TaskInteractor {
  private http: HttpClient

  constructor(@Inject(HTTP_TODO_REPOSITORY) private todoInteractor: TodoInteractor) {
    this.http = inject(HttpClient)
  }

  add(taskName: string, todoListId: string): Observable<Task> {
    return undefined!
  }

  get(taskID: string, todoListId: string): Observable<Task | undefined> {
    return undefined!
  }

  list(todoListId: string): Observable<Task[]> {
    return undefined!
  }

  remove(taskID: string, todoListId: string): Observable<boolean> {
    return undefined!
  }

  update(task: Task, todoListId: string): Observable<Task> {
    return undefined!
  }

}
