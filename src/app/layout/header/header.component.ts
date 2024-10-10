import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { CustomMatIconModule } from '../../shared/custom-icons.module';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatMenuModule,
    CustomMatIconModule
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
