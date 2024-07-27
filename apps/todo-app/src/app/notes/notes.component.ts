import { Component, OnInit } from '@angular/core'
import { FlowbiteSSRService } from '../services/flowbite-server-side-rendering.service'
import { CreateNoteComponent } from './create-note/create-note.component'

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CreateNoteComponent
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent implements OnInit {
  constructor(private flowbiteService: FlowbiteSSRService) {
  }

  ngOnInit() {
    this.flowbiteService.loadFlowbite((flowbite: any) => {
      flowbite.initModals()
      console.log('Flowbite loaded', flowbite)
    })
  }
}
