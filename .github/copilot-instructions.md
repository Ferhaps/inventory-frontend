# Copilot Instructions

---

## Project TypeScript Conventions

The project uses `strict: true` plus:
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

Never use `any`. Prefer union types and generics for flexibility.

### Naming

| Item | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `add-product-popup.component.ts` |
| Classes | `PascalCase` | `ProductsComponent`, `ProductService` |
| Methods & variables | `camelCase` | `getProducts()`, `currentCategoryId` |
| Constants | `SCREAMING_SNAKE_CASE` | `JSON_HTTP_OPTIONS`, `TOKEN_KEY` |

### Type Definitions

- Place all domain models and shared types in `src/app/shared/types.ts`
- Prefer **string literal union types** over enums: `type UserRole = 'ADMIN' | 'OPERATOR'`
- Use generic wrapper types where appropriate: `TableDataSource<T>`

### Access Modifiers

- `protected` — for members accessed in the component template
- `private` — for internals not used in the template
- Avoid `public` on class members unless part of a public API

### Environment & Constants

- All backend URLs come from `environment.backendUrl`
- Use the `environment.development.ts` override for local development
- Shared HTTP option objects live in `src/app/shared/utils.ts` — reuse them, don't create new ones

### RxJS

- Subscribe to observables directly in components (no `async` pipe required since components use signals)
- Always provide `{ next, error }` callbacks in `.subscribe()` — never ignore the `error` case
- Unsubscribe via `takeUntilDestroyed()` or `DestroyRef` to prevent memory leaks

### Authentication

- JWT token key is `TOKEN_KEY = 'INVENTORY_TOKEN'` from `src/app/shared/utils.ts`
- Use `AuthService` to read/write token and get logged user info — never access `localStorage` directly for auth

---

## Angular Component Guidelines

All components are **standalone** — always include `standalone: true` or omit it since Angular 19+ defaults to standalone.

```typescript
@Component({
  selector: 'app-example',
  host: { class: 'w-full h-full' },   // use host binding for layout classes
  imports: [...],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent { }
```

### Dependency Injection

Use `inject()` function — never constructor injection.

```typescript
private exampleService = inject(ExampleService);
private dialog = inject(MatDialog);
private loadingService = inject(LoaderService);
```

### State Management

Use Angular `signal()` for all local component state. Never use plain class properties for values bound in the template.

```typescript
protected items = signal<TableDataSource<Item>[]>([]);
protected isLoading = signal(false);
```

- Use `protected` for anything accessed from the template
- Use `private` for internals not needed in the template
- Use `.set()` to update signal values, `.update()` for derived updates

### Forms

Use **template-driven forms** with `NgForm` and `[(ngModel)]`. Never use ReactiveFormsModule.

```typescript
protected onSubmit(form: NgForm): void {
  if (form.valid) {
    this.state = 'loading';
    this.service.create(this.model).subscribe({ ... });
  }
}
```

Import `FormsModule` in the component's `imports` array.

### Popup/Dialog Components

Dialog components follow this structure:
- Accept data via `MAT_DIALOG_DATA` token
- Close with `MatDialogRef.close()`
- Use `PopupState = 'default' | 'loading'` to track submission state

```typescript
protected data = inject(MAT_DIALOG_DATA);
protected dialogRef = inject(MatDialogRef<ThisComponent>);
protected state: PopupState = 'default';
```

### Loading & Errors

- Use `LoaderService` from `@ferhaps/easy-ui-ui` for global loading spinners
- Error handling is done globally via `globalError.interceptor` — components should only reset loading state in the `error` callback of subscriptions

```typescript
this.service.getItems().subscribe({
  next: (items) => {
    this.items.set(items);
    this.loadingService.setLoading(false);
  },
  error: () => this.loadingService.setLoading(false),
});
```

### Role-Based UI

Access the logged user from `AuthService` and check `role` before showing admin-only actions:

```typescript
const user: LoggedUserInfo = this.authService.getLoggedUserInfo();
if (user.user.role === 'ADMIN') {
  this.displayedColumns.push('actions');
}
```

### Angular Material

Use Angular Material components for all UI: `MatTableModule`, `MatDialogModule`, `MatInputModule`, `MatButtonModule`, `MatMenuModule`, `MatIconModule`, `MatChipsModule`, etc. Import each module explicitly in the `imports` array.

---

## Angular Service Guidelines

All services are root-provided singletons. Use `inject()` for dependency injection.

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl + '/examples';
}
```

### HTTP Options

Always use the shared HTTP option constants from `src/app/shared/utils.ts`:

| Constant | Use case |
|---|---|
| `JSON_HTTP_OPTIONS` | Default for JSON requests/responses |
| `STRING_HTTP_OPTIONS` | When the response is plain text |
| `BLOB_HTTP_OPTIONS` | When the response is a file/binary |

```typescript
import { JSON_HTTP_OPTIONS } from '../../shared/utils';

getItems(): Observable<Item[]> {
  return this.http.get<Item[]>(this.baseUrl, JSON_HTTP_OPTIONS);
}
```

### Return Types

All methods must return strongly typed `Observable<T>`. Never use `any`.

```typescript
getById(id: number): Observable<Item> { ... }
create(body: CreateItemDto): Observable<Item> { ... }
update(id: number, body: UpdateItemDto): Observable<Item> { ... }
delete(id: number): Observable<void> { ... }
```

### URL Construction

Build URLs by string concatenation from `environment.backendUrl`. For query parameters, append directly to the URL string — do not use `HttpParams`.

```typescript
private baseUrl = environment.backendUrl + '/products';

getFiltered(categoryId: number): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.baseUrl}?categoryId=${categoryId}`, JSON_HTTP_OPTIONS);
}
```

### Error Handling

Do not add error handling inside services. Errors are handled globally by `globalError.interceptor.ts`. Services only return the raw observable.

---

## Feature Structure Guidelines

Each feature lives under `src/app/features/<feature-name>/` and follows this structure:

```
features/
  <feature-name>/
    <feature-name>.component.ts
    <feature-name>.component.html
    <feature-name>.component.scss
    <feature-name>.component.spec.ts
    data-access/
      <feature-name>.service.ts
    add-<feature-name>-popup/          # optional — for create dialogs
      add-<feature-name>-popup.component.ts
      add-<feature-name>-popup.component.html
      add-<feature-name>-popup.component.scss
```

### Route Registration

All feature routes are **lazy-loaded children** of the layout component in `src/app/routing/app.routes.ts`:

```typescript
{
  path: 'feature-name',
  loadComponent: () =>
    import('../features/feature-name/feature-name.component').then(
      (m) => m.FeatureNameComponent
    ),
},
```

Routes are protected by `authGuard`. Never add a feature route outside the layout children array.

### Types

Domain models for the feature belong in `src/app/shared/types.ts`. Add interfaces there, not in the feature folder.

### Popups

Create/edit/delete dialogs are standalone components opened via `MatDialog`. Use the shared `DefaultDeletePopupComponent` (from `@ferhaps/easy-ui-lib`) for delete confirmations instead of creating a new one.

### Naming

- Feature folder: `kebab-case` (e.g., `purchase-orders`)
- Component class: `PascalCase` + `Component` suffix (e.g., `PurchaseOrdersComponent`)
- Service class: `PascalCase` + `Service` suffix (e.g., `PurchaseOrderService`)
- Popup component class: `AddPurchaseOrderPopupComponent`

---

## Tailwind CSS Styling Guidelines

**Always prefer Tailwind utility classes over custom SCSS.** Tailwind classes are the primary styling tool for all components. Custom SCSS should only be used when a style cannot be expressed with Tailwind utilities.

### Applying Classes in Templates

Use Tailwind classes directly on HTML elements in component templates:

```html
<div class="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md">
  <span class="text-sm font-medium text-gray-700">Label</span>
  <button class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">Action</button>
</div>
```

### Host Element Styling

Use the `host` property in `@Component` for layout classes on the host element — do not target `:host` in SCSS:

```typescript
@Component({
  selector: 'app-example',
  host: { class: 'flex flex-col w-full h-full overflow-hidden' },
  ...
})
```

### When SCSS Is Acceptable

Only write custom SCSS for cases that Tailwind cannot handle:

- Third-party component overrides (e.g. Angular Material deep styles with `::ng-deep`)
- Complex CSS animations or keyframes not available as Tailwind utilities
- Dynamic styles that depend on runtime values not expressible with class bindings

```scss
// OK — overriding Material component internals
::ng-deep .mat-mdc-form-field {
  .mdc-text-field {
    border-radius: 8px;
  }
}
```

### Dynamic Classes

Use Angular class bindings with Tailwind classes for conditional styling:

```html
<!-- Conditional single class -->
<div [class.opacity-50]="isDisabled()">...</div>

<!-- Multiple conditional classes -->
<div [class]="{ 'bg-green-100 text-green-800': isActive(), 'bg-gray-100 text-gray-500': !isActive() }">...</div>
```

### Do Not

- Do not write SCSS for layout, spacing, color, typography, or flexbox/grid — use Tailwind instead
- Do not duplicate Tailwind utility values in SCSS variables (e.g. don't define `$spacing-4: 1rem` when `p-4` exists)
- Do not use inline `style` attributes — use Tailwind classes or, as a last resort, SCSS
- Do not use `styleUrl` to apply component-level styles that could be expressed with Tailwind
