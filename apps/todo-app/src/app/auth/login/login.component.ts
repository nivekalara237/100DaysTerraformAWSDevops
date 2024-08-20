import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { LoginService } from './login.service'
import { BehaviorSubject, catchError, finalize, NEVER, Subject, takeUntil, tap } from 'rxjs'
import { AsyncPipe, NgClass, NgIf } from '@angular/common'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIf,
    NgClass,
    AsyncPipe
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  protected readonly form: FormGroup
  protected signInFailed: boolean = false
  protected signInFailedMessage: string = 'Something wrong!'
  protected $loading = new BehaviorSubject<boolean>(false)
  private redirectToAfterLogged: string = '/home'
  private $unsubscribe = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private activedRoute: ActivatedRoute,
    private service: LoginService) {
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(new RegExp(''))]]
    })
  }

  get emailCtrl(): FormControl {
    return <FormControl<any>>this.form.get('email')
  }

  get passwordCtrl(): FormControl {
    return <FormControl<any>>this.form.get('password')
  }

  ngOnInit() {
    this.activedRoute.queryParamMap.subscribe(queries => {
      if (queries.has('from')) {
        this.redirectToAfterLogged = queries.get('from')!
      }
    })
  }

  login = () => {
    this.$loading.next(true)
    if (this.form.valid) {
      this.service.login(this.emailCtrl.value, this.passwordCtrl.value)
        .pipe(
          takeUntil(this.$unsubscribe),
          finalize(() => {
            this.$loading.next(false)
          }),
          catchError(err => {
            this.signInFailed = true
            this.signInFailedMessage = err
            return NEVER
          }),
          tap(value => {
            if (!value) {
              this.signInFailed = true
            } else {
              location.href = this.redirectToAfterLogged
            }
          }))
        .subscribe()
    }
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next()
    this.$unsubscribe.complete()
  }
}

