import { Component, Inject, inject } from '@angular/core';
import { DefaultDialogComponent } from '../../../../projects/ui-lib/src/public-api';
import { FormsModule, NgForm } from '@angular/forms';
import { Category, PopupState, Product } from '../../shared/types';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../data-access/product.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

type AddProductModel = {
  name: string;
  categoryId: number;
};

@Component({
  selector: 'app-add-product-popup',
  standalone: true,
  imports: [
    FormsModule,
    DefaultDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-product-popup.component.html',
  styleUrl: './add-product-popup.component.scss'
})
export class AddProductPopupComponent {
  protected model: AddProductModel = {
    name: '',
    categoryId: this.categories[0].id
  };
  protected state: PopupState = 'default';

  private productService = inject(ProductService);
  private ref = inject(MatDialogRef);

  constructor(@Inject(MAT_DIALOG_DATA) public categories: Category[]) { }

  protected onSubmit(form: NgForm): void {
    if (form.valid) {
      this.state = 'loading';
      this.productService.addProduct(this.model.name, this.model.categoryId).subscribe({
        next: (product: Product) => {
          this.ref.close(product);
        },
      });
    }
  }
}
