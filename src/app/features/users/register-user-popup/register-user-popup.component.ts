import { Component, inject } from '@angular/core';
import { DefaultDialogComponent, FieldsMatchValidatorDirective } from '../../../../../projects/ui-lib/src/public-api';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PopupState, User } from '../../../shared/types';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { PasswordValidatorDirective } from '../../../../../projects/ui-lib/src/lib/directives/password-validator.directive';
import { MatButtonModule } from '@angular/material/button';

export type RegisterUserModel = {
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  password: string;
  passwordRepeat: string;
};

@Component({
    selector: 'app-register-user-popup',
    imports: [
        DefaultDialogComponent,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatInputModule,
        FieldsMatchValidatorDirective,
        PasswordValidatorDirective,
        MatButtonModule
    ],
    templateUrl: './register-user-popup.component.html',
    styleUrl: './register-user-popup.component.scss'
})
export class RegisterUserPopupComponent {
  protected model: RegisterUserModel = {
    email: '',
    role: 'ADMIN',
    password: '',
    passwordRepeat: ''
  };
  protected state: PopupState = 'default';

  private authService = inject(AuthService);
  private ref = inject(MatDialogRef);

  protected onSubmit(form: NgForm): void {
    if (form.valid) {
      this.state = 'loading';
      const body: any = {...this.model};
      delete body.passwordRepeat;

      this.authService.register(body).subscribe({
        next: (user: User) => {
          this.ref.close(user);
        },
      });
    }
  }
}
