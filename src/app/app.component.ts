import { Component, inject } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { ErrorHandlerComponent, GlobalLoaderComponent } from '@ferhaps/easy-ui-lib';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ErrorHandlerComponent,
    GlobalLoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  constructor() {
    this.setAutoLoginRedirect();
    this.setTheme();
  }

  private setAutoLoginRedirect(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.url === '/') {
          this.router.navigateByUrl('login');
        }
      }
    });
  }

  private setTheme(): void {
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
      this.themeService.setDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeService.setDarkMode(prefersDark);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      console.log(e.matches, 2);
      if (!localStorage.getItem('preferred-theme')) {
        this.themeService.setDarkMode(e.matches);
      }
    });
  }
}
