import {
	beforeEach,
	describe,
	expect,
	it,
	type MockedObject,
	vi,
} from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogService, LoaderService } from '@ferhaps/easy-ui-lib';
import { LoggedUserInfo, User } from '../../shared/types';
import { of } from 'rxjs';
import { UsersComponent } from './users.component';
import { UserService } from './data-access/user.service';

describe('UsersComponent', () => {
	let component: UsersComponent;
	let fixture: ComponentFixture<UsersComponent>;
	let userService: MockedObject<UserService>;
	let authService: MockedObject<AuthService>;
	let loaderService: MockedObject<LoaderService>;
	let confirmDialog: MockedObject<ConfirmDialogService>;
	let dialog: MockedObject<MatDialog>;

	const mockUsers: User[] = [
		{
			id: 'user1',
			email: 'user1@test.com',
			role: 'ADMIN',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		},
		{
			id: 'user2',
			email: 'user2@test.com',
			role: 'OPERATOR',
			createdAt: '2024-01-02T00:00:00.000Z',
			updatedAt: '2024-01-02T00:00:00.000Z',
		},
	];

	const mockAdminUser: LoggedUserInfo = {
		token: 'mock-token',
		user: {
			id: 'admin-user',
			email: 'admin@test.com',
			role: 'ADMIN',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		},
	};

	const mockRegularUser: LoggedUserInfo = {
		token: 'mock-token',
		user: {
			id: 'regular-user',
			email: 'user@test.com',
			role: 'OPERATOR',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		},
	};

	/**
	 * Creates the component and settles the store's async load. The first
	 * detectChanges runs the loading effect while the store is still 'loading';
	 * the second runs it again once the promise has resolved.
	 */
	const createComponent = async (): Promise<void> => {
		fixture = TestBed.createComponent(UsersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [UsersComponent],
			providers: [
				provideZonelessChangeDetection(),
				{
					provide: UserService,
					useValue: { getUsers: vi.fn(), deleteUser: vi.fn() },
				},
				{ provide: AuthService, useValue: { getLoggedUserInfo: vi.fn() } },
				{ provide: LoaderService, useValue: { setLoading: vi.fn() } },
				{ provide: ConfirmDialogService, useValue: { confirm: vi.fn() } },
			],
			// MatDialogModule is imported by the component itself, so a plain
			// provider would lose to it — override replaces it everywhere.
		}).overrideProvider(MatDialog, { useValue: { open: vi.fn() } });

		userService = TestBed.inject(UserService) as MockedObject<UserService>;
		authService = TestBed.inject(AuthService) as MockedObject<AuthService>;
		loaderService = TestBed.inject(
			LoaderService,
		) as MockedObject<LoaderService>;
		confirmDialog = TestBed.inject(
			ConfirmDialogService,
		) as MockedObject<ConfirmDialogService>;
		dialog = TestBed.inject(MatDialog) as MockedObject<MatDialog>;

		authService.getLoggedUserInfo.mockReturnValue(mockRegularUser);
		userService.getUsers.mockResolvedValue(mockUsers);
		dialog.open.mockReturnValue({ afterClosed: () => of(undefined) } as never);
	});

	describe('Component Initialization', () => {
		it('should create the component', async () => {
			userService.getUsers.mockResolvedValue([]);

			await createComponent();

			expect(component).toBeTruthy();
		});

		it('should add actions column for ADMIN users', async () => {
			authService.getLoggedUserInfo.mockReturnValue(mockAdminUser);

			await createComponent();

			expect(component['displayedColumns']).toContain('actions');
		});

		it('should not add actions column for non-ADMIN users', async () => {
			await createComponent();

			expect(component['displayedColumns']).not.toContain('actions');
		});

		it('should load users on init', async () => {
			authService.getLoggedUserInfo.mockReturnValue(mockAdminUser);

			await createComponent();

			expect(userService.getUsers).toHaveBeenCalled();
			expect(component['users']()).toEqual(
				mockUsers.map((u) => ({ ...u, actions: ['Delete'] })),
			);
		});

		it('should not offer Delete on the logged-in user’s own row', async () => {
			authService.getLoggedUserInfo.mockReturnValue({
				...mockAdminUser,
				user: mockUsers[0],
			});

			await createComponent();

			expect(component['users']()[0].actions).toEqual([]);
			expect(component['users']()[1].actions).toEqual(['Delete']);
		});

		it('should give non-ADMIN users no row actions', async () => {
			await createComponent();

			expect(component['users']().every((u) => u.actions.length === 0)).toBe(
				true,
			);
		});

		it('should set loading state correctly', async () => {
			await createComponent();

			expect(loaderService.setLoading).toHaveBeenCalledWith(true);
			expect(loaderService.setLoading).toHaveBeenCalledWith(false);
		});
	});

	describe('Register User', () => {
		beforeEach(async () => {
			authService.getLoggedUserInfo.mockReturnValue(mockAdminUser);
			await createComponent();
		});

		it('should open the register popup', () => {
			component['openRegisterUserPopup']();

			expect(dialog.open).toHaveBeenCalled();
		});

		it('should add the returned user to the list', async () => {
			const newUser: User = {
				id: 'user3',
				email: 'user3@test.com',
				role: 'OPERATOR',
				createdAt: '2024-01-03T00:00:00.000Z',
				updatedAt: '2024-01-03T00:00:00.000Z',
			};
			dialog.open.mockReturnValue({ afterClosed: () => of(newUser) } as never);

			component['openRegisterUserPopup']();
			await fixture.whenStable();

			expect(component['users']().length).toBe(mockUsers.length + 1);
			expect(component['users']()[0].id).toBe('user3');
		});

		it('should not change the list when the popup is dismissed', async () => {
			component['openRegisterUserPopup']();
			await fixture.whenStable();

			expect(component['users']().length).toBe(mockUsers.length);
		});
	});

	describe('Delete User', () => {
		beforeEach(async () => {
			authService.getLoggedUserInfo.mockReturnValue(mockAdminUser);
			userService.deleteUser.mockReturnValue(of({}));
			await createComponent();
		});

		it('should open the confirm dialog', async () => {
			confirmDialog.confirm.mockResolvedValue(false);

			component['selectOption'](mockUsers[0], 'Delete');
			await fixture.whenStable();

			expect(confirmDialog.confirm).toHaveBeenCalledWith(
				expect.objectContaining({ confirmText: 'Delete', danger: true }),
			);
		});

		it('should delete user when confirmed', async () => {
			confirmDialog.confirm.mockResolvedValue(true);
			const initialLength = component['users']().length;

			component['selectOption'](mockUsers[0], 'Delete');
			await fixture.whenStable();

			expect(userService.deleteUser).toHaveBeenCalledWith('user1');
			expect(component['users']().length).toBe(initialLength - 1);
			expect(component['users']().find((u) => u.id === 'user1')).toBeUndefined();
		});

		it('should not delete user when cancelled', async () => {
			confirmDialog.confirm.mockResolvedValue(false);
			const initialLength = component['users']().length;

			component['selectOption'](mockUsers[0], 'Delete');
			await fixture.whenStable();

			expect(userService.deleteUser).not.toHaveBeenCalled();
			expect(component['users']().length).toBe(initialLength);
		});

		it('should ignore unknown actions', async () => {
			component['selectOption'](mockUsers[0], 'Edit');
			await fixture.whenStable();

			expect(confirmDialog.confirm).not.toHaveBeenCalled();
			expect(userService.deleteUser).not.toHaveBeenCalled();
		});
	});
});
