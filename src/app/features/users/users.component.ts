import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { UserService } from './data-access/user.service';
import { RegisterUserPopupComponent } from './register-user-popup/register-user-popup.component';
import { LoggedUserInfo, TableDataSource, User } from '../../shared/types';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogService } from '@ferhaps/easy-ui-lib';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { UsersStore } from './store/users.store';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-users',
	host: { class: 'w-full h-full' },
	imports: [
		MatTableModule,
		MatDialogModule,
		MatIconModule,
		MatMenuModule,
		MatButtonModule,
		DatePipe,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './users.component.html',
	styleUrl: './users.component.scss',
})
export class UsersComponent {
	protected users = computed<TableDataSource<User>[]>(() =>
		this.usersStore.users().map((u) => ({
			...u,
			actions:
				this.loggedUser.user.role === 'ADMIN' &&
				u.id !== this.loggedUser.user.id
					? ['Delete']
					: [],
		})),
	);
	protected displayedColumns: string[] = [
		'email',
		'role',
		'createdAt',
		'updatedAt',
	];
	protected loggedUser: LoggedUserInfo;

	private confirmDialog = inject(ConfirmDialogService);
	private readonly usersStore = inject(UsersStore);
	private userService = inject(UserService);
	private authService = inject(AuthService);
	private dialog = inject(MatDialog);

	constructor() {
		this.loggedUser = this.authService.getLoggedUserInfo();
		if (this.loggedUser?.user?.role === 'ADMIN') {
			this.displayedColumns.push('actions');
		}

		this.usersStore.load();
	}

	protected openRegisterUserPopup(): void {
		const popup = this.dialog.open(RegisterUserPopupComponent, {
			width: '350px',
			scrollStrategy: new NoopScrollStrategy(),
		});

		popup.afterClosed().subscribe((user: User | undefined) => {
			if (user) {
				const newUser = {
					...user,
					actions: this.loggedUser.user.role === 'ADMIN' ? ['Delete'] : [],
				};
				this.usersStore.addOne(newUser);
			}
		});
	}

	private async openDeleteUserPopup(user: User): Promise<void> {
		const confirmed = await this.confirmDialog.confirm({
			title: `Delete user "${user.email}"?`,
			message: 'This action cannot be undone.',
			confirmText: 'Delete',
			danger: true,
		});

		if (confirmed) {
			this.userService.deleteUser(user.id).subscribe(() => {
				this.usersStore.removeOne(user.id);
			});
		}
	}

	protected selectOption(user: User, action: string): void {
		if (action === 'Delete') {
			this.openDeleteUserPopup(user);
		}
	}
}
