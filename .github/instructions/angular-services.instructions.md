---
description: "Use when creating or modifying Angular services in data-access folders. Covers HttpClient patterns, typed Observables, HTTP options constants, and singleton service setup."
applyTo: "src/**/data-access/*.service.ts"
---

# Angular Service Guidelines

## Structure

All services are root-provided singletons. Use `inject()` for dependency injection.

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl + '/examples';
}
```

## HTTP Options

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

## Return Types

All methods must return strongly typed `Observable<T>`. Never use `any`.

```typescript
getById(id: number): Observable<Item> { ... }
create(body: CreateItemDto): Observable<Item> { ... }
update(id: number, body: UpdateItemDto): Observable<Item> { ... }
delete(id: number): Observable<void> { ... }
```

## URL Construction

Build URLs by string concatenation from `environment.backendUrl`. For query parameters, append directly to the URL string — do not use `HttpParams`.

```typescript
private baseUrl = environment.backendUrl + '/products';

getFiltered(categoryId: number): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.baseUrl}?categoryId=${categoryId}`, JSON_HTTP_OPTIONS);
}
```

## Error Handling

Do not add error handling inside services. Errors are handled globally by `globalError.interceptor.ts`. Services only return the raw observable.
