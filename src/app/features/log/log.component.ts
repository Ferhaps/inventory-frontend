import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	computed,
	inject,
	signal,
	viewChild,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
	MatAutocomplete,
	MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
	DateAdapter,
	MatNativeDateModule,
	MatOption,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LogTableComponent } from './log-table/log-table.component';
import { LogService } from './data-access/log.service';
import { Category, Log, LogBody, Product, User } from '../../shared/types';
import { CustomDateAdapter } from '../../shared/custom-date-adapter';
import { ProductService } from '../products/data-access/product.service';
import { LoaderService, SnakeCaseParserPipe } from '@ferhaps/easy-ui-lib';
import { CategoriesStore } from '../categories/store/categories.store';
import { UsersStore } from '../users/store/users.store';

type QuickDateFilter =
	| 'Today'
	| '1 week'
	| '1 month'
	| 'This week'
	| 'This month'
	| 'This year';

@Component({
	selector: 'app-log',
	host: { class: 'w-full h-full' },
	imports: [
		LogTableComponent,
		MatProgressSpinnerModule,
		MatSelectModule,
		FormsModule,
		MatFormFieldModule,
		MatIconModule,
		MatAutocompleteModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
		SnakeCaseParserPipe,
		MatChipsModule,
		MatMenuModule,
		MatButtonModule,
	],
	providers: [
		SnakeCaseParserPipe,
		{ provide: DateAdapter, useClass: CustomDateAdapter },
	],
	templateUrl: './log.component.html',
	styleUrls: ['./log.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogComponent implements OnInit {
	protected logTable = viewChild.required<LogTableComponent>('logTable');
	protected logs: Log[] = [];

	protected range = signal<{ start: Date | null; end: Date | null }>({
		start: null,
		end: null,
	});
	protected quickDateFiltes = signal<QuickDateFilter[]>(['Today', '1 week', '1 month']);
	protected moreFilters = signal<QuickDateFilter[]>([
		'This week',
		'This month',
		'This year',
	]);
	protected selectedDateFilter = signal<QuickDateFilter | undefined>(undefined);

	protected selectedEvent = signal<string>('');
	protected searchEvent: string = '';
	private lastSelectedEvent: string = '';
	protected allLogEvents: string[] = [];
	protected filteredLogEvents = signal<string[]>([]);

	protected selectedUserId = signal<string | undefined>(undefined);
	private lastSelectedUserId: string | undefined;
	protected searchUser: string | undefined;
	protected allUsers = computed(() => this.usersStore.users());
	protected filteredUsers = signal<User[]>([]);

	protected selectedProductId = signal<string | undefined>(undefined);
	private lastSelectedProductId: string | undefined;
	protected searchProduct: string | undefined;
	protected allProducts: Product[] = [];
	protected filteredProducts: Product[] = [];

	protected selectedCategoryId = signal<string | undefined>(undefined);
	private lastSelectedCategorytId: string | undefined;
	protected searchCategory: string | undefined;
	protected allCategories = computed(() => this.categoryStore.categories());
	protected filteredCategories = signal<Category[]>([]);

	protected isLogFiltered = computed(() =>
		Boolean(this.selectedEvent()) ||
		Boolean(this.selectedUserId()) ||
		Boolean(this.selectedProductId()) ||
		Boolean(this.selectedCategoryId()) ||
		Boolean(this.range().start) ||
		Boolean(this.range().end) ||
		Boolean(this.selectedDateFilter()),
	);
	protected isFetching = signal(false);
	protected stopScrolling: boolean = false;
	private itemsPerPage: number = 50;

	private readonly categoryStore = inject(CategoriesStore);
	private readonly usersStore = inject(UsersStore);
	private snakeCasePipe = inject(SnakeCaseParserPipe);
	private productService = inject(ProductService);
	private loaderService = inject(LoaderService);
	private logService = inject(LogService);
	private cdr = inject(ChangeDetectorRef);

	public async ngOnInit(): Promise<void> {
		this.getLogs(true);
		this.getEvents();
		this.getProducts();

		
		this.setUsers();
		this.setCategories();
	}

	protected getLogs(init: boolean = false): void {
		if (init) {
			this.loaderService.setLoading(true);
		}

		const body: LogBody = {
			pageSize: this.itemsPerPage,
		};

		if (this.selectedEvent()) {
			body.event = this.selectedEvent();
		}

		if (this.selectedUserId) {
			body.user = this.selectedUserId();
		}

		if (this.selectedProductId()) {
			body.product = this.selectedProductId();
		}

		if (this.selectedCategoryId()) {
			body.category = this.selectedCategoryId();
		}

		if (this.range().start && this.range().end) {
			body.startDate = this.range().start as Date;
			body.endDate = this.range().end as Date;
		}

		this.logService.getLogs(body).subscribe({
			next: (logs: Log[]) => {
				this.loaderService.setLoading(false);
				this.isFetching.set(false);
				if (logs.length < this.itemsPerPage) {
					this.stopScrolling = true;
				}
				this.logs = [...logs];
				this.cdr.markForCheck();
			},
			error: () => {
				this.loaderService.setLoading(false);
				this.isFetching.set(false);
				this.cdr.markForCheck();
			},
		});
	}

	private getEvents(): void {
		this.logService.getLogEvents().subscribe((types: string[]) => {
			this.allLogEvents = types;
			this.filteredLogEvents.set(types);
		});
	}

	private async setUsers(): Promise<void> {
		await this.usersStore.load();
		this.filteredUsers.set(this.allUsers());
	}

	private getProducts(): void {
		this.productService.getProducts().subscribe((products: Product[]) => {
			if (products) {
				this.allProducts = products;
				this.filteredProducts = products;
			}
		});
	}

	private async setCategories(): Promise<void> {
		await this.categoryStore.load();
		this.filteredCategories.set(this.allCategories());
	}

	protected onEventOptionClick(auto: MatAutocomplete): void {
		if (this.lastSelectedEvent && this.selectedEvent() === this.lastSelectedEvent) {
			this.selectedEvent.set('');
			this.lastSelectedEvent = '';
			this.searchEvent = '';
			this.filteredLogEvents.set(this.allLogEvents);
			auto.options.forEach((o: MatOption) => o.deselect());
			this.resetPaging();
			this.getLogs(true);
			return;
		}

		this.lastSelectedEvent = this.selectedEvent();
		this.searchEvent = this.snakeCasePipe.transform(this.selectedEvent());
		this.resetPaging();
		this.getLogs(true);
	}

	protected onUsersClick(auto: MatAutocomplete): void {
		if (this.lastSelectedUserId && this.selectedUserId() === this.lastSelectedUserId) {
			this.selectedUserId.set('');
			this.lastSelectedUserId = '';
			this.searchUser = '';
			this.filteredUsers.set(this.allUsers());
			auto.options.forEach((o: MatOption) => o.deselect());
			this.resetPaging();
			this.getLogs(true);
			return;
		}

		this.lastSelectedUserId = this.selectedUserId();
		this.resetPaging();
		this.getLogs(true);
	}

	protected onProductClick(auto: MatAutocomplete): void {
		if (this.lastSelectedProductId && this.selectedProductId() === this.lastSelectedProductId) {
			this.selectedProductId.set('');
			this.lastSelectedProductId = '';
			this.searchProduct = '';
			this.filteredProducts = this.allProducts;
			auto.options.forEach((o: MatOption) => o.deselect());
			this.resetPaging();
			this.getLogs(true);
			return;
		}

		this.lastSelectedProductId = this.selectedProductId();
		this.resetPaging();
		this.getLogs(true);
	}

	protected onCategoryClick(auto: MatAutocomplete): void {
		if (this.lastSelectedCategorytId && this.selectedCategoryId() === this.lastSelectedCategorytId) {
			this.selectedCategoryId.set('');
			this.lastSelectedCategorytId = '';
			this.searchCategory = '';
			this.filteredCategories.set(this.allCategories());
			auto.options.forEach((o: MatOption) => o.deselect());
			this.resetPaging();
			this.getLogs(true);
			return;
		}

		this.lastSelectedCategorytId = this.selectedCategoryId();
		this.resetPaging();
		this.getLogs(true);
	}

	protected onDateFilterChange(): void {
		this.resetPaging();
		switch (this.selectedDateFilter()) {
			case 'Today': {
				const start = new Date();
				start.setHours(0, 0, 0, 0);
				this.range.set({ start, end: new Date() });
				break;
			}
			case '1 week': {
				const start = new Date();
				start.setDate(start.getDate() - 6);
				this.range.set({ start, end: new Date() });
				break;
			}
			case '1 month': {
				const start = new Date();
				start.setMonth(start.getMonth() - 1);
				this.range.set({ start, end: new Date() });
				break;
			}
			case 'This week': {
				const start = new Date();
				start.setDate(start.getDate() - start.getDay());
				this.range.set({ start, end: new Date() });
				break;
			}
			case 'This month': {
				const start = new Date();
				start.setDate(1);
				this.range.set({ start, end: new Date() });
				break;
			}
			case 'This year': {
				const start = new Date();
				start.setMonth(0);
				start.setDate(1);
				this.range.set({ start, end: new Date() });
				break;
			}
			default:
				this.range.set({ start: null, end: null });
				break;
		}
		this.getLogs(true);
	}

	protected switchQuickFilterPlaces(filter: QuickDateFilter, index: number): void {
		const first = this.quickDateFiltes()[0];
		this.quickDateFiltes.update(q => {
			const copy = [...q];
			copy[0] = filter;
			return copy;
		});
		this.moreFilters.update(m => {
			const copy = [...m];
			copy[index] = first;
			return copy;
		});
}

	protected onDateChange(): void {
		if (this.range().start && this.range().end) {
			this.range.set({ start: this.range().start, end: this.range().end });
			this.resetPaging();
			this.getLogs(true);
		}
}

	protected filterAutocomplete(
		type: 'events' | 'users' | 'products' | 'categories',
		value: string | undefined,
	): void {
		if (value) {
			const filterValue = value.toLowerCase();

			if (type === 'events') {
				this.filteredLogEvents.set(this.allLogEvents.filter((event) =>
					this.snakeCasePipe
						.transform(event)
						.toLowerCase()
						.includes(filterValue),
				));
			}

			if (type === 'users') {
				this.filteredUsers.set(this.allUsers().filter((user) =>
					user.email.toLowerCase().includes(filterValue),
				));
			}

			if (type === 'products') {
				this.filteredProducts = this.allProducts.filter((product) =>
					product.name.toLowerCase().includes(filterValue),
				);
			}

			if (type === 'categories') {
				this.filteredCategories.set(this.allCategories().filter((category) =>
					category.name.toLowerCase().includes(filterValue),
				));
			}
		} else {
			if (type === 'events') {
				this.filteredLogEvents.set(this.allLogEvents);
			} else if (type === 'users') {
				this.filteredUsers.set(this.allUsers());
			} else if (type === 'products') {
				this.filteredProducts = this.allProducts;
			} else if (type === 'categories') {
				this.filteredCategories.set(this.allCategories());
			}
		}
	}

	protected clearFilters(eventsAuto: MatAutocomplete): void {
		eventsAuto.options.forEach((o: MatOption) => o.deselect());
		this.resetPaging();
		this.stopScrolling = false;
		this.range.set({ start: null, end: null });
		this.selectedDateFilter.set(undefined);
		this.selectedEvent.set('');
		this.searchEvent = '';
		this.lastSelectedEvent = '';

		this.lastSelectedUserId = undefined;
		this.selectedUserId.set(undefined);
		this.searchUser = undefined;

		this.lastSelectedProductId = undefined;
		this.selectedProductId.set(undefined);
		this.searchProduct = undefined;

		this.lastSelectedCategorytId = undefined;
		this.selectedCategoryId.set(undefined);
		this.searchCategory = undefined;
		this.getLogs(true);
	}

	protected onScroll(): void {
		if (this.isFetching() || this.stopScrolling) {
			return;
		}
		this.itemsPerPage += 50;
		this.isFetching.set(true);
		this.getLogs();
	}

	protected resetPaging(): void {
		this.itemsPerPage = 50;
		this.logTable().scrollContainer().nativeElement.scrollTo(0, 0);
	}
}
