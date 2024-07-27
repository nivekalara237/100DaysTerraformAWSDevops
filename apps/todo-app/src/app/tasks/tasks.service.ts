import { Inject, Injectable } from '@angular/core'
import { MEMORY_TASK_REPOSITORY } from '../infra/memory/task-memory.repository'
import { TaskInteractor } from '../core/interactor/task.interactor'
import { Observable, of } from 'rxjs'
import { HttpResponse } from '@angular/common/http'
import { TaskDTO } from './model/task.dto'
import { domainToDTO } from './task.mapper'

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  constructor(@Inject(MEMORY_TASK_REPOSITORY) private taskInteractor: TaskInteractor) {
  }

  public addTask = (name: string, todoListId: string): Observable<HttpResponse<TaskDTO>> => {
    return of(
      new HttpResponse<TaskDTO>({
        body: domainToDTO(this.taskInteractor.add(name, todoListId)),
        statusText: 'CREATED',
        status: 201
      })
    )
  }

  public deleteTask = (taskId: string, todoListId: string): Observable<HttpResponse<boolean>> => {
    return of(
      new HttpResponse<boolean>({
        body: this.taskInteractor.remove(taskId, todoListId),
        statusText: 'DELETED',
        status: 204
      })
    )
  }

  public updateTask = (task: TaskDTO, todoListId: string): Observable<HttpResponse<TaskDTO>> => {
    return of(
      new HttpResponse<TaskDTO>({
        body: domainToDTO(this.taskInteractor.update({
          ...task
        }, todoListId)),
        statusText: 'OK',
        status: 200
      })
    )
  }

  public getTodoTasks = (todoListId: string): Observable<HttpResponse<TaskDTO[]>> => {
    return of(
      new HttpResponse<TaskDTO[]>({
        body: this.taskInteractor.list(todoListId).map(domainToDTO),
        statusText: 'OK',
        status: 200
      })
    )
  }

}
