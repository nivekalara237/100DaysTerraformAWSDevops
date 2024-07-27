import { Component, OnInit } from '@angular/core'
import { ListComponent } from './list-todo/list.component'
import { NgIf } from '@angular/common'
import { TaskListComponent } from './task-list/task-list.component'
import { TodoDTO } from './model/todo.dto'
import { TodoSevice } from './todo.sevice'

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    ListComponent,
    NgIf,
    TaskListComponent
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  currentTodo!: TodoDTO

  constructor(private todoService: TodoSevice) {
  }

  ngOnInit() {
    this.todoService.getAllTodos().subscribe(value => {
      if (value.body?.length) {
        this.currentTodo = value.body.at(0)!
      }
    })
  }

  selectCurrentTodo($event: any) {
    this.currentTodo = $event
  }
}
