import { Task } from '../domain/task.domain'
import { Observable } from 'rxjs'

export interface TaskInteractor {
  add(taskName: string, todoListId: string): Observable<Task>

  list(todoListId: string): Observable<Task[]>

  remove(taskID: string, todoListId: string): Observable<boolean>

  get(taskID: string, todoListId: string): Observable<Task | undefined>

  update(task: Task, todoListId: string): Observable<Task>
}
