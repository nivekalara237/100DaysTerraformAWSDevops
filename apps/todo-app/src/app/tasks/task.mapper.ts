import { Task } from '../core/domain/task.domain'
import { TaskDTO } from './model/task.dto'

export const domainToDTO = (domain: Task): TaskDTO => ({
  ...domain,
  status: domain.status
})
