import { AfterViewInit, Component, Input, OnInit } from '@angular/core'
import { NgClass, NgIf } from '@angular/common'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { FlowbiteSSRService } from '../../services/flowbite-server-side-rendering.service'
import { TasksService } from '../tasks.service'
import { TodoDTO } from '../model/todo.dto'
import { TaskDTO } from '../model/task.dto'
import { TaskStatusEnum } from '../../core/domain/task-status.domain'
import { timeAgo } from '../../utils/time.utils'
import moment from 'moment'

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit, AfterViewInit {
  formCreateTask!: FormGroup
  expendAdvanced = false
  tasks: TaskDTO[] = []
  protected readonly TaskStatusEnum = TaskStatusEnum

  constructor(private formBuilder: FormBuilder,
              private flowbite: FlowbiteSSRService,
              private taskService: TasksService) {
  }

  _todo!: TodoDTO

  @Input({ required: true })
  get todo() {
    return this._todo
  }

  set todo(value: TodoDTO) {
    this._todo = value
    this.loadTasks()
  }

  get nameCtrl(): FormControl {
    return <FormControl<any>>this.formCreateTask.get('taskName')
  }

  ngOnInit() {
    this.formCreateTask = this.formBuilder.group({
      taskName: ['', Validators.required],
      tags: [null, []],
      startDate: ['', []],
      startTime: ['', []],
      endDate: ['', []],
      endTime: ['', []]
    })

    this.flowbite.loadFlowbite((flowbite: any) => {
      flowbite.initDatepickers()
    })

    // this.loadTasks()
  }

  expand() {
    this.expendAdvanced = !this.expendAdvanced
  }

  loadTasks = () => {
    this.taskService.getTodoTasks(this.todo.id!)
      .subscribe(value => {
        this.tasks = value || []
      })
  }

  ngAfterViewInit(): void {

  }

  addTask() {
    if (this.formCreateTask.valid) {
      if (this.tasks.findIndex((value: { name: any }) => value?.name === this.nameCtrl.value) === -1) {
        this.taskService.addTask(
          this.nameCtrl.value,
          this.todo.id!
        ).subscribe(value => {
          this.loadTasks()
          this.formCreateTask.reset(null, { emitEvent: false })
        })
      }
    }
  }

  completeOrNotTask($event: Event, task: TaskDTO) {
    // @ts-ignore
    const toUpdate = { ...task, status: $event.target.checked ? TaskStatusEnum.COMPLETED : TaskStatusEnum.RUNNING }
    this.taskService.updateTask(toUpdate, this.todo.id!)
      .subscribe(value => {
        this.loadTasks()
      })
  }

  _timeAgo(createdAt: string) {
    return timeAgo(moment(createdAt).toDate())
  }

  deleteTask(task: TaskDTO) {
    this.taskService.deleteTask(task.id!, this.todo.id!)
      .subscribe(value => {
        this.loadTasks()
      })
  }
}
