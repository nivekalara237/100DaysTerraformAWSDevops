import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

@Injectable({ providedIn: 'root' })
export class FlowbiteSSRService {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {
  }

  loadFlowbite(callback: (flowbite: any) => void) {
    if (isPlatformBrowser(this.platformId)) {
      import('flowbite').then(flowbite => callback(flowbite))
    }
  }
}
