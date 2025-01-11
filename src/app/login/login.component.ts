import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TOKEN_KEY } from '../shared/utils';
import { MatIconModule } from '@angular/material/icon';
import { PasswordValidatorDirective } from '../../../projects/ui-lib/src/lib/directives/password-validator.directive';
import { LoggedUserInfo } from '../shared/types';

@Component({
    selector: 'app-login',
    imports: [
        FormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        PasswordValidatorDirective
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
  protected loginModel: { email: string, password: string } = { email: '', password: '' };
  protected isLoading = signal(false);
  protected hidePass = signal(true);

  private authService = inject(AuthService);
  private router = inject(Router);
  
  constructor () {
    const userInfo: LoggedUserInfo = JSON.parse(localStorage.getItem(TOKEN_KEY)!);
    if (userInfo?.token) {
      this.router.navigateByUrl('products');
    }
  }

  protected onPassEyeClick(event: MouseEvent): void {
    event.preventDefault();
    this.hidePass.set(!this.hidePass());
  }

  protected onLoginSubmit(f: NgForm): void {
    if (f.valid) {
      this.isLoading.set(true);
      this.authService.login(this.loginModel).subscribe({
        next: (userInfo: LoggedUserInfo) => {
          if (userInfo?.token) {
            localStorage.setItem(TOKEN_KEY, JSON.stringify(userInfo));
            this.router.navigateByUrl('products');
          } else {
            this.isLoading.set(false);
          }
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    }
  }

  // private autoLogin(token: string): void {
  //   this.authService.extendToken(token).subscribe({
  //     next: () => {
  //       localStorage.setItem(TOKEN_KEY, token);
  //       this.router.navigateByUrl('products');
  //     },
  //     error: () => {
  //       this.isLoading.set(false);
  //     }
  //   })
  // }
}
