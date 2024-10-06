import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TOKEN_KEY } from '../shared/utils';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ErrorDispalyComponent, SystemError } from '../../../projects/ui-lib/src/public-api';
import { PasswordValidatorDirective } from '../../../projects/ui-lib/src/lib/directives/password-validator.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    ErrorDispalyComponent,
    MatProgressSpinnerModule,
    PasswordValidatorDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  protected loginModel: { email: string, password: string } = { email: '', password: '' };
  protected httpError: SystemError | null = null;
  protected isLoading = signal(false);
  protected hidePass = signal(true);

  private authService = inject(AuthService);
  private router = inject(Router);
  
  constructor () {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      this.autoLogin(token);
    }
  }

  protected onPassEyeClick(event: MouseEvent): void {
    this.hidePass.set(!this.hidePass());
    event.stopPropagation();
  }

  protected onLoginSubmit(f: NgForm): void {
    this.httpError = null;

    if (f.valid) {
      this.isLoading.set(true);
      this.authService.login(this.loginModel).subscribe({
        next: (res: { accessToken: string }) => {
          if (res?.accessToken) {
            const token: string = res.accessToken;
            localStorage.setItem(TOKEN_KEY, token);
            this.router.navigate(['/products']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.httpError = err;
          this.isLoading.set(false);
        }
      });
    }
  }

  private autoLogin(token: string): void {
    this.authService.extendToken(token).subscribe({
      next: () => {
        localStorage.setItem(TOKEN_KEY, token);
        this.router.navigate(['/products']);
      },
      error: (err: HttpErrorResponse) => {
        this.httpError = err;
        this.isLoading.set(false);
      }
    })
  }
}
