import { Component, inject, OnInit } from '@angular/core';
import { Category, LoggedUserInfo, Product, TableDataSource } from '../shared/types';
import { ProductService } from './data-access/product.service';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { CategoryService } from '../categories/data-access/category.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddProductPopupComponent } from './add-product-popup/add-product-popup.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { LoaderService } from '../../../projects/ui-lib/src/public-api';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  protected categories: Category[] = [];
  protected currentCategoryId: number = 0;
  protected tableDataSource: TableDataSource<Product>[] = [];
  protected displayedColumns: string[] = ['name', 'quantity'];
  private allProducts: Product[] = [];
  private productActions: string[] = [];

  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private loadingService = inject(LoaderService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  constructor() {
    const loggedUser: LoggedUserInfo = this.authService.getLoggedUserInfo();
    if (loggedUser.user.role === 'ADMIN') {
      this.displayedColumns.push('actions');
      this.productActions.push('Delete');
    }
  }
  
  public ngOnInit(): void {
    this.getCategories();
  }

  private getCategories(): void {
    this.loadingService.setLoading(true);
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        if (categories.length) {
          this.categories = categories;
          this.currentCategoryId = categories[0].id;
          this.getProducts();
        } else {
          this.loadingService.setLoading(false);
        }
        console.log(categories);
      },
      error: () => this.loadingService.setLoading(false)
    });
  }

  private getProducts(): void {
    this.productService.getProduts().subscribe({
      next: (products: Product[]) => {
        this.allProducts = products;
        this.setCurrentProducts();
        this.loadingService.setLoading(false);
        console.log(products);
      },
      error: () => this.loadingService.setLoading(false)
    });
  }

  protected showProductsOfCategory(event: MatChipListboxChange): void {
    this.currentCategoryId = event.value;
    this.setCurrentProducts();
  }

  private setCurrentProducts(): void {
    const products = this.allProducts.filter((product) => product.categoryId === this.currentCategoryId);
    this.tableDataSource = products.map((product) => ({ actions: this.productActions, ...product }));
  }

  protected updateQuantity(product: Product): void {
    this.productService.updateProductQuantity(product.id, product.quantity).subscribe();
  }

  protected openAddProductPopup(): void {
    const popup = this.dialog.open(AddProductPopupComponent, {
      width: '350px',
      data: this.categories,
      scrollStrategy: new NoopScrollStrategy()
    });

    popup.afterClosed().subscribe((product: Product | undefined) => {
      if (product) {
        this.allProducts.push(product);
        this.setCurrentProducts();
      }
    });
  }

  protected selectOption(product: Product, action: string): void {
    if (action === 'Delete') {
      this.productService.deleteProduct(product.id).subscribe(() => {
        this.allProducts = this.allProducts.filter((p) => p.id !== product.id);
        this.setCurrentProducts();
      });
    }
  }
}
