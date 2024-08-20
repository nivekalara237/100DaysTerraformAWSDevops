import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { AsyncPipe, isPlatformBrowser, NgClass, NgIf } from '@angular/common'
import { AlertInfoService } from './components/alert/alert-info.service'
import { AlertComponent } from './components/alert/alert.component'
import { TokenLocalManagerInteractor } from './core/interactor/token-local-manager.interactor'
import { MEMORY_TOKEN_REPOSITORY } from './infra/memory/token-local-manager.repository'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, NgIf, AlertComponent, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'todo-app'

  constructor(@Inject(PLATFORM_ID) private platformId: any,
              @Inject(MEMORY_TOKEN_REPOSITORY) protected tokenManager: TokenLocalManagerInteractor,
              protected alert: AlertInfoService) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // initFlowbite()
    }
  }

  logout() {
    this.tokenManager.resetToken()
    location.reload()
  }
}
