import { TodoDTO } from './model/todo.dto'
import { Todo } from '../core/domain/todo.domain'

export const domainToDTO = (domain: Todo): TodoDTO => {
  return <TodoDTO>{
    name: domain.name,
    createdAt: domain.createdAt,
    id: domain.id,
    owner: domain.owner
  }
}

