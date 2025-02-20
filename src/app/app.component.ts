import { Component, inject } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { ErrorHandlerComponent, GlobalLoaderComponent } from '@ferhaps/easy-ui-lib';

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

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.url === '/') {
          this.router.navigateByUrl('login');
        }
      }
    });
  }
}
