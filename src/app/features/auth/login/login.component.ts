import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from 'src/app/services/auth.service';
import { AdminRoutingModule } from '../../admin/admin-routing.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule,
    RouterModule         
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  loading = false;

    constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

    onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .subscribe({
      next: () => {
        if (this.authService.mustChangePassword()) {
          this.router.navigate(['/auth/change-password']);
          return;
        }
      
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
      
        // Rôles depuis le token / session
        const roles = this.authService.getRoles();            // ← ajoute la méthode ci-dessous
        const isSuperAdmin = roles.includes('SUPER_ADMIN');
      
        // Si un returnUrl est fourni, on le respecte.
        // Sinon: SUPER_ADMIN → /platform-admin, le reste → /dashboard
        const target =
          returnUrl ?? (isSuperAdmin ? '/platform-admin' : '/dashboard');
      
        this.router.navigateByUrl(target);
      },
        error: err => {
          this.error = 'Email ou mot de passe invalide. Veuillez réessayer.';
          this.loading = false;
        }
      });
  }
}
