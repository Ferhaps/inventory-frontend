import {
	Component,
	DestroyRef,
	OnInit,
	computed,
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
import { UserService } from '../users/data-access/user.service';
import { LogService } from '../log/data-access/log.service';
import { Log, Product } from '../../shared/types';
import { CategoriesStore } from '../categories/store/categories.store';

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
	protected categories = computed(() => this.categoriesStore.categories());
	protected totalCategories = computed(() => this.categories().length);
	protected totalUsers = signal(0);
	protected lowStockCount = signal(0);
	protected recentLogs = signal<Log[]>([]);
	protected isLoaded = signal(false);

	protected products: Product[] = [];

	private readonly categoriesStore = inject(CategoriesStore);
	private productService = inject(ProductService);
	private userService = inject(UserService);
	private logService = inject(LogService);
	private loaderService = inject(LoaderService);
	private destroyRef = inject(DestroyRef);

	public ngOnInit(): void {
		this.loaderService.setLoading(true);
		this.categoriesStore.load();

		forkJoin({
			products: this.productService.getProducts(),
			users: this.userService.getUsers(),
			logs: this.logService.getLogs({ pageSize: 10 }),
		})
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: ({ products, users, logs }) => {
					this.products = products;

					this.totalProducts.set(products.length);
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
