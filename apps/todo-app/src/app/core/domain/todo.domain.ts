import { Task } from './task.domain'

export interface Todo {
  name: string;
  createdAt?: string;
  owner?: {
    name: string,
    email: string
  },
  id?: string,
  tasks?: Task[]
}
