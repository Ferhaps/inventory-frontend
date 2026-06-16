import { inject } from "@angular/core";
import { Category } from "../../../shared/types";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CategoryService } from "../data-access/category.service";

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
		async load(): Promise<void> {
			if (store.status() !== 'idle') return;
			patchState(store, { status: 'loading' });

			try {
				const categories = await categoryService.getCategories();
				patchState(store, { categories, status: 'loaded' });
			} catch {
				patchState(store, { status: 'error' });
			}
	},

		addOne(category: Category): void {
			patchState(store, { categories: [ category, ...store.categories()] });
		},

		removeOne(id: string): void {
			patchState(store, { categories: store.categories().filter((c: Category) => c.id !== id) });
		}
	}))
);