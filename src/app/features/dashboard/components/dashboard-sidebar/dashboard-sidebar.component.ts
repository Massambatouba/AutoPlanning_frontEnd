import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyRoutingModule } from 'src/app/features/company/company-routing.model';

@Component({
  standalone: true,
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompanyRoutingModule
  ]
})
export class DashboardSidebarComponent {
   notifications = [
    {
      message: 'Le planning "Avril 2025" a été publié',
      time: 'il y a 2 heures',
      icon: 'event'
    },
    {
      message: 'Nouvel employé Jean Dupont ajouté',
      time: 'il y a 1 jour',
      icon: 'person'
    }
  ];
}
