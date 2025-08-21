// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  standalone: true,
  selector   : 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls  : ['./reset-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]   // ⬅️ ReactiveForms !
})
export class ResetPasswordComponent implements OnInit {

  token = '';
  loading = false;
  done    = false;
  error?  : string;

  form!: FormGroup;

  constructor(
    private fb      : FormBuilder,
    private route   : ActivatedRoute,
    private router  : Router,
    private auth    : AuthService,
    private toast   : ToastrService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm : ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  /** validator de groupe : password === confirm */
  private passwordMatch(group: FormGroup) {
    const pw  = group.get('password')!.value;
    const cfm = group.get('confirm')!.value;
    return pw === cfm ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) { return; }

    this.loading = true;
    const password = this.form.value.password;

    this.auth.resetPassword(this.token, password).subscribe({
      next : () => {
        this.done    = true;
        this.loading = false;
        // Facultatif : redirection après 2 s
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: err => {
        this.loading = false;
        this.toast.error(err.message || 'Erreur serveur');
      }
    });
  }
}
