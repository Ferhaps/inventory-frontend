import { Component, Inject, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Category, PopupState, Product } from '../../../shared/types';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../data-access/product.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DefaultDialogComponent } from '@ferhaps/easy-ui-lib';

type AddProductModel = {
	name: string;
	categoryId: string | undefined;
	quantity: number;
};

type AddProductDialogData = {
	categories: Category[];
	currentCategoryId: string;
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
	templateUrl: './add-product-popup.component.html',
	styleUrl: './add-product-popup.component.scss',
})
export class AddProductPopupComponent {
	protected model: AddProductModel = {
		name: '',
		categoryId: undefined,
		quantity: 0,
	};
	protected state: PopupState = 'default';
	protected categories: Category[] = [];

	private productService = inject(ProductService);
	private ref = inject(MatDialogRef);

	constructor(@Inject(MAT_DIALOG_DATA) data: AddProductDialogData) {
		this.categories = data.categories;
		this.model.categoryId = data.currentCategoryId || (data.categories[0]?.id);
	}

	protected onSubmit(form: NgForm): void {
		if (form.valid) {
			this.state = 'loading';
			this.productService
				.addProduct(this.model.name, this.model.categoryId as string, this.model.quantity)
				.subscribe({
					next: (product: Product) => {
						this.ref.close(product);
					},
				});
		}
	}
}
