import { Component } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'
import { NgOptimizedImage } from '@angular/common'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    NgOptimizedImage,
    RouterOutlet
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
