import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { CategoryService } from './data-access/category.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Category, LoggedUserInfo, TableDataSource } from '../../shared/types';
import { AddCategoryPopupComponent } from './add-category-popup/add-category-popup.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { DefaultDeletePopupComponent } from '../../shared/default-delete-popup/default-delete-popup.component';
import { LoaderService } from '@ferhaps/easy-ui-lib';
import { CategoriesStore } from './store/categories.store';

@Component({
	selector: 'app-categories',
	host: { class: 'w-full h-full' },
	imports: [
		MatMenuModule,
		MatIconModule,
		MatTableModule,
		MatDialogModule,
		MatButtonModule,
		DatePipe,
	],
	templateUrl: './categories.component.html',
	styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
	protected categories = computed(() => this.store.categories().map((c) => ({ ...c, actions: ['Delete'] })));
	protected displayedColumns: string[] = ['name', 'dateCreated', 'dateUpdated'];

	private categoryService = inject(CategoryService);
	private loadingService = inject(LoaderService);
	private authService = inject(AuthService);
	private dialog = inject(MatDialog);
	private readonly store = inject(CategoriesStore);

	constructor() {
		const loggedUser: LoggedUserInfo = this.authService.getLoggedUserInfo();
		if (loggedUser.user.role === 'ADMIN') {
			this.displayedColumns.push('actions');
		}

		effect(() => {
			this.loadingService.setLoading(this.store.status() === 'loading');
		});
		this.store.load();
	}

	protected openAddCategoryPopup(): void {
		const popup = this.dialog.open(AddCategoryPopupComponent, {
			width: '350px',
			scrollStrategy: new NoopScrollStrategy(),
		});

		popup.afterClosed().subscribe((category: Category | undefined) => {
			if (category) {
				this.store.addOne(category);
			}
		});
	}

	private openDeleteCategoryPopup(category: Category): void {
		const ref = this.dialog.open(DefaultDeletePopupComponent, {
			width: '350px',
			data: `category: ${category.name}. Keep in mind that all the products that belong to this category will be deleted as well`,
			autoFocus: false,
			scrollStrategy: new NoopScrollStrategy(),
		});

		ref.afterClosed().subscribe((result: boolean) => {
			if (result) {
				this.categoryService.deleteCategory(category.id).subscribe({
					next: () => this.store.removeOne(category.id)
				});
			}
		});
	}

	protected selectOption(category: Category, action: string): void {
		if (action === 'Delete') {
			this.openDeleteCategoryPopup(category);
		}
	}
}
