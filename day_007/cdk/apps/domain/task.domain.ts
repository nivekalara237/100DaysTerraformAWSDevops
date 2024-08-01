import { IDomain } from './abstract.domain'

export interface Task extends IDomain {
  taskName: string,
  status: TaskStatus
}