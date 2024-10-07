import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../shared/types';
import { ProductService } from './data-access/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  protected products: Product[] = [];

  private productService = inject(ProductService);
  
  public ngOnInit(): void {
    this.getProducts();
  }

  private getProducts(): void {
    this.productService.getProduts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        console.log(products);
      },
      error: () => {
        console.error('Error while fetching products');
    }});
  }
}
