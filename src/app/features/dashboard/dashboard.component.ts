import {
	Component,
	DestroyRef,
	ElementRef,
	OnInit,
	inject,
	signal,
	viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { LoaderService, SnakeCaseParserPipe } from '@ferhaps/easy-ui-lib';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../products/data-access/product.service';
import { CategoryService } from '../categories/data-access/category.service';
import { UserService } from '../users/data-access/user.service';
import { LogService } from '../log/data-access/log.service';
import { Category, Log, Product } from '../../shared/types';

Chart.register(...registerables);

const LOW_STOCK_THRESHOLD = 20;

const CHART_COLORS = [
	'#31adff',
	'#0288d1',
	'#4fc3f7',
	'#0097a7',
	'#81d4fa',
	'#006064',
	'#b3e5fc',
	'#0050b3',
	'#29b6f6',
];

@Component({
	selector: 'app-dashboard',
	host: { class: 'w-full h-full' },
	imports: [DatePipe, SnakeCaseParserPipe, MatIconModule],
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

	private products: Product[] = [];
	private categories: Category[] = [];
	private chart: Chart | null = null;

	private chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

	private productService = inject(ProductService);
	private categoryService = inject(CategoryService);
	private userService = inject(UserService);
	private logService = inject(LogService);
	private loaderService = inject(LoaderService);
	private destroyRef = inject(DestroyRef);

	constructor() {
		this.destroyRef.onDestroy(() => this.chart?.destroy());
	}

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
					this.buildChart();
				},
				error: () => this.loaderService.setLoading(false),
			});
	}

	private buildChart(): void {
		const canvasRef = this.chartCanvas();
		if (!canvasRef) return;

		const categoryMap = new Map(this.categories.map((c) => [c.id, c.name]));
		const countByCategory = new Map<string, number>();

		for (const product of this.products) {
			const name = categoryMap.get(product.categoryId) ?? 'Unknown';
			countByCategory.set(name, (countByCategory.get(name) ?? 0) + 1);
		}

		const labels = Array.from(countByCategory.keys());
		const data = Array.from(countByCategory.values());

		this.chart?.destroy();

		this.chart = new Chart(canvasRef.nativeElement, {
			type: 'doughnut',
			data: {
				labels,
				datasets: [
					{
						data,
						backgroundColor: CHART_COLORS.slice(0, labels.length),
						borderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							padding: 16,
							boxWidth: 14,
						},
					},
				},
			},
		});
	}
}
