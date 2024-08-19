import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { BehaviorSubject, catchError, finalize, NEVER, Subject, takeUntil, tap } from 'rxjs'
import { SignupService } from './signup.service'
import { AsyncPipe, NgClass, NgIf } from '@angular/common'
import { Router, RouterLink } from '@angular/router'

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, OnDestroy {

  protected $loading = new BehaviorSubject<boolean>(false)
  protected readonly form: FormGroup
  protected signUpFailed: boolean = false
  protected signUpFailedMessage: string = ''
  private $unsubscribe = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: SignupService) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.email, Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: [null],
      birthDate: [null],
      password: ['', [Validators.required, Validators.pattern(new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/))]],
      repassword: ['', [Validators.required, Validators.pattern(new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/))]]
    })
  }

  get usernameCtrl(): FormControl {
    return <FormControl<any>>this.form.get('username')
  }


  get firstNameCtrl(): FormControl {
    return <FormControl<any>>this.form.get('firstName')
  }

  get lastNameCtrl(): FormControl {
    return <FormControl<any>>this.form.get('lastName')
  }

  get emailCtrl(): FormControl {
    return <FormControl<any>>this.form.get('email')
  }

  get passwordCtrl(): FormControl {
    return <FormControl<any>>this.form.get('password')
  }

  get confirmPasswordCtrl(): FormControl {
    return <FormControl<any>>this.form.get('repassword')
  }

  ngOnInit() {
  }

  register = () => {
    if (this.form.valid) {
      this.$loading.next(true)
      this.service.register(this.form.value)
        .pipe(
          takeUntil(this.$unsubscribe),
          finalize(() => {
            this.$loading.next(false)
          }),
          catchError(err => {
            this.signUpFailed = false
            this.signUpFailedMessage = err
            return NEVER
          }),
          tap(value => {
            if (!value) {
              this.signUpFailed = true
            } else {
              this.router.navigate(['/dashboard'], {
                queryParams: {
                  message: 'The verification code has been sent to your.',
                  confirmEmail: true
                }
              }).then()
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
