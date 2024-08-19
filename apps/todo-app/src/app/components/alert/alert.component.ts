import { Component, Input } from '@angular/core'
import { Config } from './alert.model'

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {

  @Input({ required: true }) config!: Config
  @Input({ required: true }) alertId!: string

  color() {
    const colorMap: { [key: string]: string } = {
      'warn': 'yellow',
      'success': 'green',
      'error': 'red'
    }
    return colorMap[this.config.type] || 'blue'
  }
}
