import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error?: string;
  success?: string;

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  submit() {
    this.error = this.success = undefined;
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.'; return;
    }
    this.loading = true;
    this.http.put(`${environment.apiUrl}/me/password`, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Mot de passe modifié.';
        this.auth.setMustChangePassword(false);
        setTimeout(() => this.router.navigateByUrl('/'), 600);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Échec du changement de mot de passe.';
      }
    });
  }
}
