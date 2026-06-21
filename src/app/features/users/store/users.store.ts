import { inject } from "@angular/core";
import { User } from "../../../shared/types";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { UserService } from "../data-access/user.service";

type UsersStatus = 'idle' | 'loading' | 'loaded' | 'error';

type UsersState = {
	users: User[];
	status: UsersStatus;
};

export const UsersStore = signalStore(
	{ providedIn: 'root' },
	withState<UsersState>({
		users: [],
		status: 'idle',
	}),

	withMethods((store, userService = inject(UserService)) => ({
		async load(): Promise<void> {
			if (store.status() !== 'idle') return;
			patchState(store, { status: 'loading' });

			try {
				const users = await userService.getUsers();
				patchState(store, { users, status: 'loaded' });
			} catch {
				patchState(store, { status: 'error' });
			}
	},

		addOne(user: User): void {
			patchState(store, { users: [user, ...store.users()] });
		},

		removeOne(id: string): void {
			patchState(store, { users: store.users().filter((u: User) => u.id !== id) });
		}
	}))
);