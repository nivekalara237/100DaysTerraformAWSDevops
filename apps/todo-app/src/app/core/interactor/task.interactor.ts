import { Task } from '../domain/task.domain'

export interface TaskInteractor {
  add(taskName: string, todoListId: string): Task

  list(todoListId: string): Task[]

  remove(taskID: string, todoListId: string): boolean

  get(taskID: string, todoListId: string): Task | undefined

  update(task: Task, todoListId: string): Task
}
