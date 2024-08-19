import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmEmailService } from './confirm-email.service'

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [],
  template: ''
})
export class ConfirmEmailComponent implements OnInit {

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private confirmEmailService: ConfirmEmailService) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(query => {
      if (query.has('code') && query.has('email') && query.has('username')) {
        this.confirmEmailService.confirm(query.get('email')!, query.get('username')!, query.get('code')!)
          .subscribe(value => {
            this.router.navigate(['/dashboard'], value ? {
              queryParams: {
                emailConfirmed: true
              }
            } : {}).then(value1 => {
            })
          }, error => {
            this.router.navigate(['/dashboard'], {
              queryParams: {
                emailConfirmed: false,
                error: error
              }
            }).then()
          })
      } else {
        this.router.navigateByUrl('/home').then()
      }
    })
  }

}
