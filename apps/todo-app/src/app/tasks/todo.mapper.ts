import { TodoDTO } from './model/todo.dto'
import { Todo } from '../core/domain/todo.domain'
import { TodoResponseDto } from '../infra/endpoints/http/dto/todo-response.dto'

export const domainsToDTOs = (domain: Todo[]): TodoDTO[] =>
  [...(domain || [])].map(domainToDTO)
export const domainToDTO = (domain: Todo): TodoDTO => {
  return {
    name: domain.name,
    createdAt: domain.createdAt!,
    id: domain.id,
    owner: domain.owner
  }
}


export const httoToDTO = (http: TodoResponseDto): TodoDTO => {
  return <TodoDTO>{
    name: http.name,
    createdAt: http.createdAt,
    id: http.id,
    owner: {
      name: http.owner.fullName,
      email: http.owner.email
    }
  }
}

