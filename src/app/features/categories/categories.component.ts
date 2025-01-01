import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { CategoryService } from './data-access/category.service';
import { LoaderService } from '../../../../projects/ui-lib/src/public-api';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Category, LoggedUserInfo, TableDataSource } from '../../shared/types';
import { AddCategoryPopupComponent } from './add-category-popup/add-category-popup.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    NgClass,
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
  protected categories: TableDataSource<Category>[] = [];
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
        this.categories = categories.map((c) => ({ ...c, actions: ['Delete'] }));
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
        this.categories = [({ ...category, actions: ['Delete'] }), ...this.categories];
      }
    });
  }

  protected selectOption(category: Category, action: string): void {
    if (action === 'Delete') {
      this.categoryService.deletetCategory(category.id).subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c.id !== category.id);
      }});
    }
  }
}
