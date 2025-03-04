import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { CustomMatIconModule } from '../../shared/custom-icons.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  imports: [
    AsyncPipe,
    MatMenuModule,
    CustomMatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
    MatSlideToggleModule
  ]
})
export class HeaderComponent {
  private authService = inject(AuthService);

  public themeService = inject(ThemeService);

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
