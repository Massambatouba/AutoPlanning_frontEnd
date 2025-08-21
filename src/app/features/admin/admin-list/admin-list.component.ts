import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { UserDto } from 'src/app/shared/models/user.model';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {
  private adminSrv = inject(AdminService);
  private auth     = inject(AuthService);
  private toast    = inject(ToastrService);

  loading = true;
  admins: UserDto[] = [];
  myId?: number;

  ngOnInit(): void {
    this.myId = this.auth.getCurrentUser()?.id;
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.adminSrv.list().subscribe({
      next: list => { this.admins = list ?? []; },
      error: () => this.toast.error('Chargement impossible'),
      complete: () => this.loading = false
    });
  }

  isMe(u: UserDto): boolean { return !!this.myId && u.id === this.myId; }

  roleLabel(r: string): string {
    const key = r.replace(/^ROLE_/, '');
    const map: Record<string,string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Admin',
      COMPANY_ADMIN: 'Admin société',
      SITE_ADMIN: 'Admin-site'
    };
    return map[key] ?? key;
  }
  roleClass(r: string): string {
    const key = r.replace(/^ROLE_/, '');
    if (key === 'SUPER_ADMIN') return 'bg-danger';
    if (key === 'ADMIN' || key === 'COMPANY_ADMIN') return 'bg-primary';
    if (key === 'SITE_ADMIN') return 'bg-info';
    return 'bg-secondary';
  }

  accessLabel(u: UserDto): string {
    return u.manageAllSites ? 'Tous les sites' : `${u.siteIds?.length ?? 0} site(s)`;
  }

  grantAll(id: number) {
    this.adminSrv.updateAccessAll(id).subscribe({
      next: u => {
        const row = this.admins.find(x => x.id === id);
        if (row) { row.manageAllSites = true; row.siteIds = []; }
        this.toast.success('Accès global accordé');
      },
      error: () => this.toast.error('Échec : tout accorder')
    });
  }

  /** “Retirer tout” = passer en mode liste avec la liste courante (ou vide si tu veux couper l’accès) */
  revokeAll(a: UserDto) {
    const siteIds = a.siteIds && a.siteIds.length ? a.siteIds : [];
    this.adminSrv.updateAccessList(a.id, siteIds).subscribe({
      next: u => {
        a.manageAllSites = false;
        a.siteIds = u.siteIds ?? siteIds;
        this.toast.success('Accès global retiré');
      },
      error: () => this.toast.error('Action impossible')
    });
  }

  toggleActive(a: UserDto) {
    this.adminSrv.setStatus(a.id, !a.active).subscribe({
      next: u => Object.assign(a, u),
      error: () => this.toast.error('Impossible de modifier le statut')
    });
  }

  remove(u: UserDto) {
    if (this.isMe(u)) {
      this.toast.warning('Vous ne pouvez pas vous supprimer vous-même.');
      return;
    }
    if (!confirm(`Supprimer l'admin ${u.firstName} ${u.lastName} ?`)) return;

    this.adminSrv.removeAdmin(u.id).subscribe({
      next: () => {
        this.admins = this.admins.filter(x => x.id !== u.id);
        this.toast.success('Admin supprimé');
      },
      error: () => this.toast.error('Suppression impossible')
    });
  }

}

