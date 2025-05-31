import { Component } from '@angular/core';
import { AdminRoutingModule } from '../admin-routing.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
   imports: [
      //AdminRoutingModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule         // routes paresseuses /admin
    ]
})
export class AdminComponent {

}
