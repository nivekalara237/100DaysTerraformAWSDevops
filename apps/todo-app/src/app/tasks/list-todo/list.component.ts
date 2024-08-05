import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgClass, NgIf } from '@angular/common'
import { TodoSevice } from '../todo.sevice'
import { TodoDTO } from '../model/todo.dto'

@Component({
  selector: 'app-list-todo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  formCreateTodo!: FormGroup
  errors: { todoExist?: boolean } = {}
  todoList: Array<TodoDTO> = []

  @Output() selected = new EventEmitter<any>()

  constructor(private fb: FormBuilder, private todoService: TodoSevice) {
  }

  get nameCtrl(): FormControl {
    return <FormControl<any>>this.formCreateTodo.get('name')
  }

  ngOnInit() {
    this.formCreateTodo = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(64)]]
    })
    this.loadTodoList()
  }

  addTodoList() {
    if (this.formCreateTodo.valid) {
      if (-1 !== this.todoList.findIndex((value: { name: any }) => value.name === this.nameCtrl.value)) {
        this.errors.todoExist = true
      } else {
        this.todoService.addTodo(this.nameCtrl.value!)
          .subscribe({
            next: (value) => {
              this.formCreateTodo.patchValue({ name: null }, { emitEvent: false, onlySelf: true })
              this.errors.todoExist = false
              this.loadTodoList()
            },
            error: (err) => {
              this.errors.todoExist = true
            }
          })

      }
    }
  }

  select(todo: any) {
    this.selected.emit(todo)
  }

  private loadTodoList() {
    this.todoService.getAllTodos()
      .subscribe(value => {
        this.todoList = value
      })
  }
}
