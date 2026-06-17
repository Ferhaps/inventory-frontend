import { ChangeDetectionStrategy, Component, computed, Inject, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Category, CreateProductBody, PopupState, Product } from '../../../shared/types';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../data-access/product.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DefaultDialogComponent } from '@ferhaps/easy-ui-lib';
import { CategoriesStore } from '../../categories/store/categories.store';

type AddProductModel = {
	name: string;
	categoryId: string | undefined;
	quantity: number;
};

@Component({
	selector: 'app-add-product-popup',
	imports: [
		FormsModule,
		DefaultDialogComponent,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatProgressSpinnerModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './add-product-popup.component.html',
	styleUrl: './add-product-popup.component.scss',
})
export class AddProductPopupComponent {
	private currentCategoryId = inject<string>(MAT_DIALOG_DATA);
	protected model: AddProductModel = {
		name: '',
		categoryId: this.currentCategoryId,
		quantity: 0,
	};
	protected state: PopupState = 'default';
	protected categories = computed(() => this.categoriesStore.categories());

	private readonly categoriesStore = inject(CategoriesStore);
	private productService = inject(ProductService);
	private ref = inject(MatDialogRef);

	protected onSubmit(form: NgForm): void {
		if (form.valid && this.model.categoryId) {
			this.state = 'loading';
			const body: CreateProductBody = {
				name: this.model.name,
				categoryId: this.model.categoryId,
				quantity: this.model.quantity,
			};
			this.productService
				.addProduct(body)
				.subscribe({
					next: (product: Product) => {
						this.ref.close(product);
					},
				});
		}
	}
}
