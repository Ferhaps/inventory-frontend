import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { UserService } from './data-access/user.service';
import { RegisterUserPopupComponent } from './register-user-popup/register-user-popup.component';
import { LoggedUserInfo, TableDataSource, User } from '../../shared/types';
import { AuthService } from '../../services/auth.service';
import { LoaderService } from '@ferhaps/easy-ui-lib';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DefaultDeletePopupComponent } from '../../shared/default-delete-popup/default-delete-popup.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-users',
  imports: [
    MatTableModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  protected users = signal<TableDataSource<User>[]>([]);
  protected displayedColumns: string[] = ['email', 'role'];
  protected loggedUser: LoggedUserInfo;
  
  private userService = inject(UserService);
  private loadingService = inject(LoaderService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  constructor() {
    this.loggedUser = this.authService.getLoggedUserInfo();
    if (this.loggedUser?.user?.role === 'ADMIN') {
      this.displayedColumns.push('actions');
    }
  }

  public ngOnInit(): void {
    this.getUsers();
  }

  private getUsers(): void {
    this.loadingService.setLoading(true);
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users.set(
          users.map((u) => ({
            ...u,
            actions: this.loggedUser.user.role === 'ADMIN' && u.id !== this.loggedUser.user.id ? ['Delete'] : []
          }))
        );
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
        const newUser = {
          ...user,
          actions: this.loggedUser.user.role === 'ADMIN' ? ['Delete'] : []
        };
        this.users.set([...this.users(), newUser]);
      }
    });
  }

   private openUserCategoryPopup(user: User): void {
      const ref = this.dialog.open(DefaultDeletePopupComponent, {
        width: '350px',
        data: `user: ${user.email}`,
        autoFocus: false,
        restoreFocus: false,
        scrollStrategy: new NoopScrollStrategy()
      });
      
      ref.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.userService.deleteUser(user.id).subscribe({
            next: () => {
              this.users.set(this.users().filter((c) => c.id !== user.id));
          }});
        }
      });
    }

  protected selectOption(user: User, action: string): void {
    if (action === 'Delete') {
      this.openUserCategoryPopup(user);
    }
  }
}
