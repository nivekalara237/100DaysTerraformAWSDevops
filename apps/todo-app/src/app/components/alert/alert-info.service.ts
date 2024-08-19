import { Subject } from 'rxjs'
import { Injectable } from '@angular/core'
import { v4 } from 'uuid'
import { Alert, Config } from './alert.model'

@Injectable({ providedIn: 'root' })
export class AlertInfoService {
  public $subscription = new Subject<Alert>()

  alert = (config: Config) => {
    this.$subscription
      .next({
        id: v4(),
        config
      })
  }
}
