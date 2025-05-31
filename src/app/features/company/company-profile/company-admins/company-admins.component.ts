import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { AdminInvitation } from 'src/app/shared/models/admin-invation.model';
import { User } from 'src/app/shared/models/user.model';
import { CompanyRoutingModule } from '../../company-routing.model';

@Component({
  standalone: true,
  selector: 'app-company-admins',
  templateUrl: './company-admins.component.html',
  styleUrls: ['./company-admins.component.scss'],
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
      CompanyRoutingModule,
      CompanyRoutingModule
    ]
})
export class CompanyAdminsComponent implements OnInit {

  inviteForm: FormGroup;
  admins:       User[]             = [];
  invitations:  AdminInvitation[]  = [];
  currentUser:  User | null        = null;

  sending = false;
  error   = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private authService:  AuthService
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.currentUser = this.authService.getCurrentUser();
  }

  /* ---------- init ---------- */
  ngOnInit(): void {
    this.loadAdmins();
    this.loadInvitations();
  }

  /* ---------- chargements ---------- */
  private loadAdmins(): void {
    // À remplacer par un appel API réel
    this.admins = this.currentUser ? [this.currentUser] : [];
  }

  private loadInvitations(): void {
    this.adminService.getInvitations().subscribe({
      next:  invs => this.invitations = invs,
      error: err  => this.error = err.message
    });
  }

  /* ---------- actions ---------- */
  sendInvitation(): void {
    if (this.inviteForm.invalid) return;

    this.sending = true;
    const email = this.inviteForm.value.email as string;

    this.adminService.inviteAdmin(email).subscribe({
      next: inv => {
        this.invitations.push(inv);
        this.inviteForm.reset();
        this.sending = false;
      },
      error: err => {
        this.error  = err.message;
        this.sending = false;
      }
    });
  }

  cancelInvitation(id: number): void {
    this.adminService.cancelInvitation(id).subscribe({
      next: () => this.invitations = this.invitations.filter(i => i.id !== id),
      error: err => this.error = err.message
    });
  }

  removeAdmin(userId: number): void {
    this.adminService.removeAdmin(userId).subscribe({
      next: () => this.admins = this.admins.filter(a => a.id !== userId),
      error: err  => this.error = err.message
    });
  }

}
