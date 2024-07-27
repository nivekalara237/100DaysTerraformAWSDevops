import { Inject, Injectable, InjectionToken } from '@angular/core'
import { TaskInteractor } from '../../core/interactor/task.interactor'
import { Task } from '../../core/domain/task.domain'
import { Todo } from '../../core/domain/todo.domain'
import moment from 'moment'
import { v4 } from 'uuid'
import { TodoInteractor } from '../../core/interactor/todo.interactor'
import { MEMORY_TODO_REPOSITORY, TodoMemoryRepository } from './todo-memory.repository'
import { TaskStatusEnum } from '../../core/domain/task-status.domain'
import { storage } from '../../utils/local.storage'

export const MEMORY_TASK_REPOSITORY = new InjectionToken<TaskInteractor>('Memory Task Repository', {
  providedIn: 'root',
  factory: () => new TaskMemoryRepository(new TodoMemoryRepository())
})

@Injectable()
export class TaskMemoryRepository implements TaskInteractor {
  constructor(@Inject(MEMORY_TODO_REPOSITORY) private todoInteractor: TodoInteractor) {
  }

  add(taskName: string, todoListId: string): Task {
    const tasks = this.list(todoListId)

    if (tasks.findIndex(value => value.name === taskName) >= 0) {
      throw new Error(`Task "${taskName}" is already exists`)
    }

    const task: Task = {
      name: taskName,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      id: v4(),
      status: TaskStatusEnum.RUNNING
    }
    tasks.push(task)

    const todos = this.todoInteractor.list()
      .map(value => {
        if (value.id === todoListId) {
          value.tasks = [...tasks]
        }
        return value
      })
    console.log(todos)
    storage().setItem('todos', JSON.stringify(todos, null, -2))
    return task
  }

  get(taskID: string, todoListId: string): Task | undefined {
    return this.todoInteractor.list()
      .filter(value => value.id === todoListId)
      .flatMap(value => value.tasks)
      .find(value => value?.id === taskID)
  }

  list(todoListId: string): Task[] {
    let todos: Todo[] = this.todoInteractor.list()
    const todo = todos.find(value => value.id === todoListId)
    return todo?.tasks || []
  }

  remove(taskID: string, todoListId: string): boolean {
    if (!this.get(taskID, todoListId)) {
      return false
    }
    const todos = this.todoInteractor.list()
      .map(value => {
        if (value.id === todoListId) {
          value.tasks = [...(value.tasks || [])].filter(t => t.id !== taskID)
        }
        return value
      })
    storage().setItem('todos', JSON.stringify(todos))
    return true
  }

  update(task: Task, todoListId: string): Task {
    const tasks = this.list(todoListId)
    tasks.forEach(value => {
      if (value.id === task.id) {
        value.status = task.status
        value.name = task.name
      }
    })
    const todos = this.todoInteractor.list()
      .map(value => {
        if (value.id === todoListId) {
          value.tasks = tasks
        }
        return value
      })
    storage().setItem('todos', JSON.stringify(todos))
    return task
  }
}
