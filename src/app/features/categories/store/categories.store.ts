import { computed, inject } from "@angular/core";
import { Category } from "../../../shared/types";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { CategoryService } from "../data-access/category.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { filter, pipe, switchMap, tap } from "rxjs";

type CategoriesStatus = 'idle' | 'loading' | 'loaded' | 'error';

type CategoriesState = {
	categories: Category[];
	status: CategoriesStatus;
};

export const CategoriesStore = signalStore(
	{ providedIn: 'root' },
	withState<CategoriesState>({
		categories: [],
		status: 'idle',
	}),

	withMethods((store, categoryService = inject(CategoryService)) => ({
		load: rxMethod<void>(
			pipe(
				filter(() => store.status() === 'idle'),
				tap(() => patchState(store, { status: 'loading' })),
				switchMap(() =>
					categoryService.getCategories().pipe(
						tap({
							next: (categories: Category[]) => patchState(store, { categories, status: 'loaded' }),
							error: () => patchState(store, { status: 'error' })
						})
					)
				)
			)
		),

		addOne(category: Category): void {
			patchState(store, { categories: [...store.categories(), category] });
		},

		removeOne(id: string): void {
			patchState(store, { categories: store.categories().filter((c: Category) => c.id !== id) });
		}
	}))
);