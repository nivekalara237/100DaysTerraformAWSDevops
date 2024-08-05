import { IDomain } from './abstract.domain'
import { Task } from './task.domain'

export interface TodoList extends IDomain {
  name: string;
  owner?: {
    fullName: string,
    email: string
  },
  tasks?: Task[]
}