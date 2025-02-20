import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../data-access/category.service';
import { Category, PopupState } from '../../../shared/types';
import { DefaultDialogComponent } from '@ferhaps/easy-ui-lib';

@Component({
  selector: 'app-add-category-popup',
  imports: [
    DefaultDialogComponent,
    FormsModule,
    MatButtonModule,
    MatFormField,
    MatProgressSpinnerModule,
    MatInputModule
  ],
  templateUrl: './add-category-popup.component.html',
  styleUrl: './add-category-popup.component.scss'
})
export class AddCategoryPopupComponent {
  protected name: string = '';
  protected state: PopupState = 'default';

  private categoryService = inject(CategoryService);
  private ref = inject(MatDialogRef);

  protected onSubmit(form: NgForm): void {
    if (form.valid) {
      this.state = 'loading';
      this.categoryService.addCategories(this.name).subscribe({
        next: (category: Category) => {
          this.ref.close(category);
        },
      });
    }
  }
}
