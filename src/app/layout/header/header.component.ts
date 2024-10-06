import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatMenuModule,
    MatIconModule
  ]
})
export class HeaderComponent {
  private authService = inject(AuthService);

  protected onOptionSelected(option: string): void {
    switch (option) {
      case 'Logout':
        this.authService.logout();
        break;
      default:
        break;
    }
  }
}
