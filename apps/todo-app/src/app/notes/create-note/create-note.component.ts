import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { QuillModule } from 'ngx-quill'

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    QuillModule
  ],
  templateUrl: './create-note.component.html',
  styleUrl: './create-note.component.scss'
})
export class CreateNoteComponent implements OnInit {
  form!: FormGroup

  constructor(private formBuilder: FormBuilder) {
  }

  get titleCtrl(): FormControl {
    return <FormControl<any>>this.form.get('title')
  }

  get contentCtrl(): FormControl {
    return <FormControl<any>>this.form.get('content')
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: [null, [Validators.required]],
      tags: [null],
      content: [null, [Validators.required]]
    })
  }
}
