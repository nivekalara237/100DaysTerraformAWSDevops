import { TaskStatusEnum } from './task-status.domain'

export interface Task {
  name: string,
  createdAt: string,
  id?: string,
  status?: TaskStatusEnum
}
