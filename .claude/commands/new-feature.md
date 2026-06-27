# /new-feature

Scaffold a complete new feature in this Angular 21 codebase. Follow every step in order.

## Usage

`/new-feature <feature-name>`

Example: `/new-feature purchase-orders`

---

## Step 1 — Create the feature folder

```
src/app/features/<feature-name>/
  <feature-name>.component.ts
  <feature-name>.component.html
  <feature-name>.component.scss
  <feature-name>.component.spec.ts
  data-access/
    <feature-name>.service.ts
  add-<feature-name>-popup/          # only if a create dialog is needed
    add-<feature-name>-popup.component.ts
    add-<feature-name>-popup.component.html
    add-<feature-name>-popup.component.scss
  store/
    <feature-name>.store.ts          # only if state needs to be shared/cached
```

## Step 2 — Add the domain types

Add all new interfaces/types to `src/app/shared/types.ts`. Never create type files inside the feature folder.

## Step 3 — Create the service

```typescript
// src/app/features/<feature-name>/data-access/<feature-name>.service.ts
@Injectable({ providedIn: 'root' })
export class FeatureNameService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl + '/<feature-name>s';

  getAll(): Observable<FeatureName[]> {
    return this.http.get<FeatureName[]>(this.baseUrl, JSON_HTTP_OPTIONS);
  }

  create(body: CreateFeatureNameBody): Observable<FeatureName> {
    return this.http.post<FeatureName>(this.baseUrl, body, JSON_HTTP_OPTIONS);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, JSON_HTTP_OPTIONS);
  }
}
```

- Use `JSON_HTTP_OPTIONS` / `STRING_HTTP_OPTIONS` / `BLOB_HTTP_OPTIONS` from `src/app/shared/utils.ts`
- Append query params via string interpolation — never use `HttpParams`
- No error handling in services — it's global via `globalError.interceptor.ts`

## Step 4 — Create the NgRx Signals store (if needed)

Only create a store if the entity list needs to be shared across features or cached app-wide (like categories/users). For local-only data, use component signals instead.

```typescript
// src/app/features/<feature-name>/store/<feature-name>.store.ts
type FeatureNameStatus = 'idle' | 'loading' | 'loaded' | 'error';

type FeatureNameState = {
  items: FeatureName[];
  status: FeatureNameStatus;
};

export const FeatureNameStore = signalStore(
  { providedIn: 'root' },
  withState<FeatureNameState>({ items: [], status: 'idle' }),
  withMethods((store, service = inject(FeatureNameService)) => ({
    async load(): Promise<void> {
      if (store.status() !== 'idle') return;
      patchState(store, { status: 'loading' });
      try {
        const items = await firstValueFrom(service.getAll());
        patchState(store, { items, status: 'loaded' });
      } catch {
        patchState(store, { status: 'error' });
      }
    },
    addOne(item: FeatureName): void {
      patchState(store, { items: [item, ...store.items()] });
    },
    removeOne(id: string): void {
      patchState(store, { items: store.items().filter((i) => i.id !== id) });
    },
  }))
);
```

## Step 5 — Create the component

```typescript
@Component({
  selector: 'app-feature-name',
  host: { class: 'flex flex-col w-full h-full' },
  imports: [MatTableModule, MatButtonModule, MatIconModule, ...],
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.scss',
})
export class FeatureNameComponent {
  private service = inject(FeatureNameService);
  private loader = inject(LoaderService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  protected items = signal<TableDataSource<FeatureName>[]>([]);

  ngOnInit(): void {
    this.loader.setLoading(true);
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.items.set(data.map((i) => ({ ...i, actions: [] })));
          this.loader.setLoading(false);
        },
        error: () => this.loader.setLoading(false),
      });
  }
}
```

- `protected` for anything the template accesses; `private` for everything else
- Use `LoaderService` from `@ferhaps/easy-ui-lib` for the global spinner
- Use `DefaultDeletePopupComponent` from `@ferhaps/easy-ui-lib` for delete confirmations
- Dialog components use `MAT_DIALOG_DATA` for input and `PopupState = 'default' | 'loading'` for state
- Check `AuthService.getLoggedUserInfo().user.role === 'ADMIN'` before showing admin-only actions

## Step 6 — Register the route

Add a lazy-loaded child route inside the layout children array in `src/app/routing/app.routes.ts`:

```typescript
{
  path: 'feature-name',
  title: 'Inventory Feature Name',
  loadComponent: () =>
    import('../features/feature-name/feature-name.component').then(
      (m) => m.FeatureNameComponent
    ),
},
```

Never add routes outside the layout's `children` array — all authenticated routes must be children of `LayoutComponent` and are automatically protected by `authGuard`.
