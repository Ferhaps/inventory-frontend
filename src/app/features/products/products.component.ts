import { Component, inject, OnInit, signal } from '@angular/core';
import { Category, LoggedUserInfo, Product, TableDataSource } from '../../shared/types';
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
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddProductPopupComponent } from './add-product-popup/add-product-popup.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { AuthService } from '../../services/auth.service';
import { DefaultDeletePopupComponent } from '../../shared/default-delete-popup/default-delete-popup.component';
import { LoaderService } from '@ferhaps/easy-ui-lib';

@Component({
  selector: 'app-products',
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
    DatePipe
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  public categories: Category[] = [];
  public currentCategoryId: string = '';
  public tableDataSource = signal<TableDataSource<Product>[]>([]);
  public displayedColumns: string[] = ['name', 'quantity', 'dateCreated', 'dateUpdated'];
  public allProducts: Product[] = [];
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
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.allProducts = products;
        this.setCurrentProducts();
        this.loadingService.setLoading(false);
        console.log(products);
      },
      error: () => this.loadingService.setLoading(false)
    });
  }

  public showProductsOfCategory(event: MatChipListboxChange): void {
    this.currentCategoryId = event.value;
    this.setCurrentProducts();
  }

  private setCurrentProducts(): void {
    const products = this.allProducts.filter((product) => product.categoryId === this.currentCategoryId);
    this.tableDataSource.set(products.map((product) => (
      { 
        actions: this.productActions,
        ...product,
        newQuantity: product.quantity
      }
    )));
  }

  public updateQuantity(productObj: Product): void {
    this.productService.updateProductQuantity(productObj.id, productObj.newQuantity).subscribe({
      next: () => {
        const product: Product = this.allProducts.find((p) => p.id === productObj.id)!;
        product.quantity = productObj.newQuantity;
        this.setCurrentProducts();
      },
      error: () => this.setCurrentProducts()
    });
  }

  public openAddProductPopup(): void {
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

  private openDeleteProductPopup(product: Product): void {
    const ref = this.dialog.open(DefaultDeletePopupComponent, {
      width: '350px',
      data: `product: ${product.name}`,
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy()
    });
    
    ref.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.allProducts = this.allProducts.filter((p) => p.id !== product.id);
            this.setCurrentProducts();
          }
        });
      }
    });
  }

  public selectOption(product: Product, action: string): void {
    if (action === 'Delete') {
      this.openDeleteProductPopup(product);
    }
  }
}
