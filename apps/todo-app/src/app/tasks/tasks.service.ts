import { Inject, Injectable } from '@angular/core'
// import { MEMORY_TASK_REPOSITORY } from '../infra/memory/task-memory.repository'
import { TaskInteractor } from '../core/interactor/task.interactor'
import { Observable, of } from 'rxjs'
import { TaskDTO } from './model/task.dto'
import { HTTP_TODO_REPOSITORY } from '../infra/endpoints/http/todo-http.repository'

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  constructor(@Inject(HTTP_TODO_REPOSITORY) private taskInteractor: TaskInteractor) {
  }

  public addTask = (name: string, todoListId: string): Observable<TaskDTO> => {
    return of()
  }

  public deleteTask = (taskId: string, todoListId: string): Observable<boolean> => {
    return of()
  }

  public updateTask = (task: TaskDTO, todoListId: string): Observable<TaskDTO> => {
    return of()
  }

  public getTodoTasks = (todoListId: string): Observable<TaskDTO[]> => {
    return of()
  }

}
