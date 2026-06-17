import { CategoriesStore } from './../categories/store/categories.store';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import {
	LoggedUserInfo,
	Product,
	TableDataSource,
} from '../../shared/types';
import { ProductService } from './data-access/product.service';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddProductPopupComponent } from './add-product-popup/add-product-popup.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { AuthService } from '../../services/auth.service';
import { DefaultDeletePopupComponent } from '../../shared/default-delete-popup/default-delete-popup.component';
import { LoaderService, SearchBarComponent } from '@ferhaps/easy-ui-lib';

@Component({
	selector: 'app-products',
	host: { class: 'w-full h-full' },
	imports: [
		FormsModule,
		MatMenuModule,
		MatIconModule,
		MatChipsModule,
		MatTableModule,
		MatInputModule,
		MatButtonModule,
		MatDialogModule,
		MatFormFieldModule,
		DatePipe,
		SearchBarComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './products.component.html',
	styleUrl: './products.component.scss',
})
export class ProductsComponent {
	protected categories = computed(() => this.categoriesStore.categories());
	protected currentCategoryId = signal<string | undefined>(undefined);
	protected tableDataSource = signal<TableDataSource<Product>[]>([]);
	protected searchTerm = signal('');
	protected displayedColumns: string[] = [
		'name',
		'quantity',
		'dateCreated',
		'dateUpdated',
	];
	private allProducts: Product[] = [];
	private productActions: string[] = [];

	private readonly categoriesStore = inject(CategoriesStore);
	private productService = inject(ProductService);
	private loadingService = inject(LoaderService);
	private authService = inject(AuthService);
	private dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);

	constructor() {
		const loggedUser: LoggedUserInfo = this.authService.getLoggedUserInfo();
		if (loggedUser.user.role === 'ADMIN') {
			this.displayedColumns.push('actions');
			this.productActions.push('Delete');
		}

		this.categoriesStore.load();
		effect(() => {
			if (this.categories().length > 0) {
				this.getProducts();
			}
		});
	}

	private getProducts(): void {
		this.productService.getProducts().subscribe({
			next: (products: Product[]) => {
				this.allProducts = products;
				this.currentCategoryId.set(this.categories()[0]?.id);
				this.setCurrentProducts();
				this.loadingService.setLoading(false);
				console.log('products: ', products);
			},
			error: () => this.loadingService.setLoading(false),
		});
	}

	protected showProductsForCategory(event: MatChipListboxChange): void {
		this.currentCategoryId.set(event.value);
		this.searchTerm.set('');
		this.setCurrentProducts();
	}

	protected onSearch(event: string | Event): void {
		this.searchTerm.set(typeof event === 'string' ? event : '');
		this.setCurrentProducts();
	}

	private setCurrentProducts(): void {
		const products = this.allProducts.filter(
			(product) => product.categoryId === this.currentCategoryId(),
		);
		const term = this.searchTerm().toLowerCase();
		const sorted = term
			? [...products].sort((a, b) => {
				const aMatch = a.name.toLowerCase().includes(term) ? 0 : 1;
				const bMatch = b.name.toLowerCase().includes(term) ? 0 : 1;
				return aMatch - bMatch;
			})
			: products;
		this.tableDataSource.set(
			sorted.map((product) => ({
				actions: this.productActions,
				...product,
				newQuantity: product.quantity,
			})),
		);
	}

	protected updateQuantity(productObj: Product): void {
		this.productService
			.updateProductQuantity(productObj.id, productObj.newQuantity)
			.subscribe({
				next: () => {
					const product: Product = this.allProducts.find(
						(p) => p.id === productObj.id,
					)!;
					product.quantity = productObj.newQuantity;
					this.setCurrentProducts();
					this.snackBar.open('Quantity updated successfully', 'Close', {
						duration: 3000,
					});
				},
				error: () => this.setCurrentProducts(),
			});
	}

	protected openAddProductPopup(): void {
		const popup = this.dialog.open(AddProductPopupComponent, {
			width: '350px',
			data: this.currentCategoryId(),
			scrollStrategy: new NoopScrollStrategy(),
		});

		popup.afterClosed().subscribe((product: Product | undefined) => {
			if (product) {
				this.allProducts.unshift(product);
				this.setCurrentProducts();
			}
		});
	}

	private openDeleteProductPopup(product: Product): void {
		const ref = this.dialog.open(DefaultDeletePopupComponent, {
			width: '350px',
			data: `product: ${product.name}`,
			autoFocus: false,
			scrollStrategy: new NoopScrollStrategy(),
		});

		ref.afterClosed().subscribe((result: boolean) => {
			if (result) {
				this.productService.deleteProduct(product.id).subscribe({
					next: () => {
						this.allProducts = this.allProducts.filter(
							(p) => p.id !== product.id,
						);
						this.setCurrentProducts();
					},
				});
			}
		});
	}

	protected selectOption(product: Product, action: string): void {
		if (action === 'Delete') {
			this.openDeleteProductPopup(product);
		}
	}
}
