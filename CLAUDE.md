# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server (ng serve)
npm run build      # production build
npm run watch      # dev build with watch mode
npm test           # run tests (Karma + Jasmine)
```

To run a single test file: `npx ng test --include='**/products.component.spec.ts'`

## Architecture

Angular 21 SPA with zoneless change detection (`provideZonelessChangeDetection()`), Angular Material UI, and Tailwind CSS v4.

**Routing** — Hash-based (`withHashLocation`). All authenticated routes are lazy-loaded children of `LayoutComponent`, protected by `authGuard`. The layout wraps everything except `/login`. Add new feature routes as lazy-loaded children in [src/app/routing/app.routes.ts](src/app/routing/app.routes.ts).

**Feature structure** — Features live under `src/app/features/<feature-name>/`. Use `/new-feature` to scaffold a complete feature (component, service, store, route).

**State management** — Two patterns coexist:
- `@ngrx/signals` `signalStore` for shared/cached entity lists (categories, users). Stores are `providedIn: 'root'`, load once (`if (store.status() !== 'idle') return`), and expose `addOne`/`removeOne` for optimistic updates.
- Component-local `signal()` for ephemeral UI state (loading, selected item, etc.).

**HTTP** — Services inject `HttpClient` and build URLs from `environment.backendUrl`. Always use the shared option constants from [src/app/shared/utils.ts](src/app/shared/utils.ts): `JSON_HTTP_OPTIONS`, `STRING_HTTP_OPTIONS`, `BLOB_HTTP_OPTIONS`. Query params are appended as string interpolation — do not use `HttpParams`. Services return raw `Observable<T>`; error handling is global via `globalError.interceptor.ts`.

**Auth** — `authInterceptor` attaches the JWT token on each request. Use `AuthService` to read/write the token and get the logged user — never access `localStorage` directly. Token stored under `TOKEN_KEY = 'INVENTORY_TOKEN'`.

**Shared types** — All domain models live in [src/app/shared/types.ts](src/app/shared/types.ts). Add new types there, not in feature folders.

## TypeScript Conventions

- `strict: true` + `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`
- Never use `any` — use union types or generics
- Files: `kebab-case` | Classes: `PascalCase` | Methods/variables: `camelCase` | Constants: `SCREAMING_SNAKE_CASE`
- Prefer string literal union types over enums: `type UserRole = 'ADMIN' | 'OPERATOR'`

## Component Conventions

All components are standalone (Angular 19+ default). Use `inject()` — never constructor injection.

```typescript
@Component({
  selector: 'app-example',
  host: { class: 'flex flex-col w-full h-full' },  // host binding for layout classes
  imports: [...],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent {
  private exampleService = inject(ExampleService);
  protected items = signal<TableDataSource<Item>[]>([]);  // protected = template-accessible
}
```

- `protected` for members accessed in the template; `private` for internals; avoid `public`
- Forms: template-driven (`NgForm` + `[(ngModel)]`). Use ReactiveFormsModule only for complex scenarios.
- Unsubscribe via `takeUntilDestroyed()` or `DestroyRef`; always pass `{ next, error }` to `.subscribe()`
- Use `LoaderService` (from `@ferhaps/easy-ui-lib`) for global loading spinners; reset it in the `error` callback
- Use `DefaultDeletePopupComponent` (from `@ferhaps/easy-ui-lib`) for delete confirmations — don't create new ones
- Dialog components accept data via `MAT_DIALOG_DATA` and track state with `PopupState = 'default' | 'loading'`

## Styling

Tailwind utility classes are the primary styling tool. Custom SCSS only for:
- Angular Material overrides with `::ng-deep`
- Complex CSS animations unavailable as Tailwind utilities
- Runtime-dynamic styles not expressible with class bindings

Never use inline `style` attributes. Never target `:host` in SCSS — use the `host` property in `@Component` instead.
