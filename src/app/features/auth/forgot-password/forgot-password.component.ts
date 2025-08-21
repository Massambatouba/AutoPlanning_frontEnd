import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  email = '';
  loading = false;
  done = false;
  error?: string;

  form!: FormGroup;

  constructor(private http: HttpClient,
    private auth: AuthService,
    private fb: FormBuilder,
    private toast: ToastrService) {}

  ngOnInit(): void {
      this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (!this.email) { return; }

    this.loading = true;
    this.error   = '';

    this.auth.forgotPassword(this.email).subscribe({
      next : ()  => {
        this.loading = false;
        this.done    = true;               // affiche le <ng-template #sent>
        this.toast.success(
          'Si l’email existe, un lien de réinitialisation a été envoyé.'
        );
      },
      error: err => {
        this.loading = false;
        this.error   = err?.message || 'Erreur inconnue';
        this.toast.error(this.error);
      }
    });
  }

}
