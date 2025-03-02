import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { CustomMatIconModule } from '../../shared/custom-icons.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  imports: [
    MatMenuModule,
    CustomMatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule
  ]
})
export class HeaderComponent {
  private authService = inject(AuthService);

  protected onOptionSelected(option: string): void {
    switch (option) {
      case 'logout':
        this.authService.logout();
        break;
      default:
        break;
    }
  }
}
