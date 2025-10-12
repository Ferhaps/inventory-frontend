import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-categories',
  imports: [
    MatMenuModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    DatePipe
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  protected categories = signal<TableDataSource<Category>[]>([]);
  protected displayedColumns: string[] = ['name', 'dateCreated', 'dateUpdated'];
  
  private categoryService = inject(CategoryService);
  private loadingService = inject(LoaderService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  constructor() {
    const loggedUser: LoggedUserInfo = this.authService.getLoggedUserInfo();
    if (loggedUser.user.role === 'ADMIN') {
      this.displayedColumns.push('actions');
    }
  }

  public ngOnInit(): void {
    this.getCategories();
  }

  private getCategories(): void {
    this.loadingService.setLoading(true);
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories.set(categories.map((c) => ({ ...c, actions: ['Delete'] })));
        this.loadingService.setLoading(false);
        console.log(categories);
      },
      error: () => this.loadingService.setLoading(false)
    });
  }

  protected openAddCategoryPopup(): void {
    const popup = this.dialog.open(AddCategoryPopupComponent, {
      width: '350px',
      scrollStrategy: new NoopScrollStrategy()
    });

    popup.afterClosed().subscribe((category: Category | undefined) => {
      if (category) {
        const newCategoryRow = { ...category, actions: ['Delete'] };
        this.categories.set([...this.categories(), newCategoryRow]);
      }
    });
  }

  private openDeleteCategoryPopup(category: Category): void {
    const ref = this.dialog.open(DefaultDeletePopupComponent, {
      width: '350px',
      data: `category: ${category.name}`,
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy()
    });
    
    ref.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.categories.set(this.categories().filter((c) => c.id !== category.id));
          }
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
