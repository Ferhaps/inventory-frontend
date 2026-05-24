import {
	AfterViewInit,
	Component,
	DestroyRef,
	ElementRef,
	inject,
	input,
	viewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Category, Product } from '../../../shared/types';

Chart.register(...registerables);

const CHART_COLORS = [
	'#22c55e',
	'#ef4444',
	'#3b82f6',
	'#f97316',
	'#84cc16',
	'#8b5cf6',
	'#f59e0b',
	'#14b8a6',
	'#ec4899',
];

@Component({
	selector: 'app-category-chart',
	host: { class: 'block' },
	templateUrl: './category-chart.component.html',
	styleUrl: './category-chart.component.scss',
})
export class CategoryChartComponent implements AfterViewInit {
	products = input.required<Product[]>();
	categories = input.required<Category[]>();

	private chartCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
	private chart: Chart | null = null;
	private destroyRef = inject(DestroyRef);

	constructor() {
		this.destroyRef.onDestroy(() => this.chart?.destroy());
	}

	public ngAfterViewInit(): void {
		this.buildChart();
	}

	private buildChart(): void {
		const categoryMap = new Map(this.categories().map((c) => [c.id, c.name]));
		const countByCategory = new Map<string, number>();

		for (const product of this.products()) {
			const name = categoryMap.get(product.categoryId) ?? 'Unknown';
			countByCategory.set(name, (countByCategory.get(name) ?? 0) + 1);
		}

		const labels = Array.from(countByCategory.keys());
		const data = Array.from(countByCategory.values());

		this.chart?.destroy();

		this.chart = new Chart(this.chartCanvas().nativeElement, {
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
