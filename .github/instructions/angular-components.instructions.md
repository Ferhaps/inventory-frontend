---
description: "Use when creating or modifying Angular components. Covers standalone component structure, signals for state, template-driven forms, dependency injection, Material UI, and popup/dialog patterns."
applyTo: "src/**/*.component.ts"
---

# Angular Component Guidelines

## Structure

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

## Dependency Injection

Use `inject()` function — never constructor injection.

```typescript
private exampleService = inject(ExampleService);
private dialog = inject(MatDialog);
private loadingService = inject(LoaderService);
```

## State Management

Use Angular `signal()` for all local component state. Never use plain class properties for values bound in the template.

```typescript
protected items = signal<TableDataSource<Item>[]>([]);
protected isLoading = signal(false);
```

- Use `protected` for anything accessed from the template
- Use `private` for internals not needed in the template
- Use `.set()` to update signal values, `.update()` for derived updates

## Forms

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

## Popup/Dialog Components

Dialog components follow this structure:
- Accept data via `MAT_DIALOG_DATA` token
- Close with `MatDialogRef.close()`
- Use `PopupState = 'default' | 'loading'` to track submission state

```typescript
protected data = inject(MAT_DIALOG_DATA);
protected dialogRef = inject(MatDialogRef<ThisComponent>);
protected state: PopupState = 'default';
```

## Loading & Errors

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

## Role-Based UI

Access the logged user from `AuthService` and check `role` before showing admin-only actions:

```typescript
const user: LoggedUserInfo = this.authService.getLoggedUserInfo();
if (user.user.role === 'ADMIN') {
  this.displayedColumns.push('actions');
}
```

## Angular Material

Use Angular Material components for all UI: `MatTableModule`, `MatDialogModule`, `MatInputModule`, `MatButtonModule`, `MatMenuModule`, `MatIconModule`, `MatChipsModule`, etc. Import each module explicitly in the `imports` array.
