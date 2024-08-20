import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { provideClientHydration } from '@angular/platform-browser'
import { provideQuillConfig } from 'ngx-quill/config'
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import { authorizerInterceptor } from './auth/authorizer-interceptor'
import { unauthorizedInterceptor } from './auth/unauthorized-interceptor'

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authorizerInterceptor, unauthorizedInterceptor])
    ),
    provideQuillConfig({
      modules: {
        syntax: true,
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          ['link', 'image']
        ]
      }
    })
  ]
}
