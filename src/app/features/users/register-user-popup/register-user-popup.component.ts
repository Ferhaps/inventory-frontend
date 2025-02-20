import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PopupState, User } from '../../../shared/types';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DefaultDialogComponent, FieldsMatchValidatorDirective } from '@ferhaps/easy-ui-lib';

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
