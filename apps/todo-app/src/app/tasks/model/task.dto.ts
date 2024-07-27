import { Task } from '../../core/domain/task.domain'
import { TaskStatusEnum } from '../../core/domain/task-status.domain'

export class TaskDTO implements Task {
  public id?: string
  public status?: TaskStatusEnum

  constructor(public name: string, public createdAt: string) {
    this.status = TaskStatusEnum.RUNNING
  }
}
