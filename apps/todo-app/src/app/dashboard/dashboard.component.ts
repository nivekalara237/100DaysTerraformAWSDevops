import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router'
import { NgOptimizedImage } from '@angular/common'
import { AlertInfoService } from '../components/alert/alert-info.service'

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
export class DashboardComponent implements OnInit {
  constructor(
    private alert: AlertInfoService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(query => {
      if (query.has('emailConfirmed')) {
        if (query.get('emailConfirmed') === 'true') {
          this.alert.alert({
            message: query.get('Your has been confirmed!!')!,
            type: 'success'
          })
        } else {
          this.alert.alert({
            message: query.get('error')!,
            type: 'success'
          })
        }
      }
    })
  }

}
