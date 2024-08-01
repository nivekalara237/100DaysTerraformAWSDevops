import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'
import { DashboardComponent } from './dashboard/dashboard.component'
import { isPlatformBrowser } from '@angular/common'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DashboardComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'todo-app'

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // initFlowbite()
    }
  }
}
