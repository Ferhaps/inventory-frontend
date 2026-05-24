import {
	Component,
	DestroyRef,
	OnInit,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { LoaderService } from '@ferhaps/easy-ui-lib';
import { MatIconModule } from '@angular/material/icon';
import { ActivityFeedComponent } from './activity-feed/activity-feed.component';
import { CategoryChartComponent } from './category-chart/category-chart.component';
import { ProductService } from '../products/data-access/product.service';
import { CategoryService } from '../categories/data-access/category.service';
import { UserService } from '../users/data-access/user.service';
import { LogService } from '../log/data-access/log.service';
import { Category, Log, Product } from '../../shared/types';

const LOW_STOCK_THRESHOLD = 20;

@Component({
	selector: 'app-dashboard',
	host: { class: 'w-full h-full' },
	imports: [
		MatIconModule,
		ActivityFeedComponent,
		CategoryChartComponent
	],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
	protected totalProducts = signal(0);
	protected totalCategories = signal(0);
	protected totalUsers = signal(0);
	protected lowStockCount = signal(0);
	protected recentLogs = signal<Log[]>([]);
	protected isLoaded = signal(false);

	protected products: Product[] = [];
	protected categories: Category[] = [];

	private productService = inject(ProductService);
	private categoryService = inject(CategoryService);
	private userService = inject(UserService);
	private logService = inject(LogService);
	private loaderService = inject(LoaderService);
	private destroyRef = inject(DestroyRef);

	public ngOnInit(): void {
		this.loaderService.setLoading(true);

		forkJoin({
			products: this.productService.getProducts(),
			categories: this.categoryService.getCategories(),
			users: this.userService.getUsers(),
			logs: this.logService.getLogs({ pageSize: 10 }),
		})
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: ({ products, categories, users, logs }) => {
					this.products = products;
					this.categories = categories;

					this.totalProducts.set(products.length);
					this.totalCategories.set(categories.length);
					this.totalUsers.set(users.length);
					this.lowStockCount.set(
						products.filter((p) => p.quantity < LOW_STOCK_THRESHOLD).length,
					);
					this.recentLogs.set(logs);
					this.isLoaded.set(true);

					this.loaderService.setLoading(false);
				},
				error: () => this.loaderService.setLoading(false),
			});
	}
}
