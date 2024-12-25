import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { UserService } from './data-access/user.service';
import { RegisterUserPopupComponent } from './register-user-popup/register-user-popup.component';
import { LoggedUserInfo, TableDataSource, User } from '../../shared/types';
import { LoaderService } from '../../../../projects/ui-lib/src/public-api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MatTableModule,
    MatDialogModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  protected users: TableDataSource<User>[] = [];
  protected displayedColumns: string[] = ['email', 'role'];
  protected loggedUser: LoggedUserInfo;
  
  private userService = inject(UserService);
  private loadingService = inject(LoaderService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  constructor() {
    this.loggedUser = this.authService.getLoggedUserInfo();
  }

  public ngOnInit(): void {
    this.getUsers();
  }

  private getUsers(): void {
    this.loadingService.setLoading(true);
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users.map((u) => ({ ...u, actions: [] }));
        this.loadingService.setLoading(false);
        console.log(users);
      },
      error: () => this.loadingService.setLoading(false)
    });
  }

  protected openRegisterUserPopup(): void {
    const popup = this.dialog.open(RegisterUserPopupComponent, {
      width: '350px',
      scrollStrategy: new NoopScrollStrategy()
    });

    popup.afterClosed().subscribe((user: User | undefined) => {
      if (user) {
        this.users = [({ ...user, actions: [] }), ...this.users];
      }
    });
  }
}
