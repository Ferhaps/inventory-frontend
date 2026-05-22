---
description: "Use when writing any TypeScript in this project. Covers naming conventions, TypeScript strict mode rules, shared types location, and general coding patterns."
applyTo: "src/**/*.ts"
---

# Project TypeScript Conventions

## TypeScript Strict Mode

The project uses `strict: true` plus:
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

Never use `any`. Prefer union types and generics for flexibility.

## Naming

| Item | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `add-product-popup.component.ts` |
| Classes | `PascalCase` | `ProductsComponent`, `ProductService` |
| Methods & variables | `camelCase` | `getProducts()`, `currentCategoryId` |
| Constants | `SCREAMING_SNAKE_CASE` | `JSON_HTTP_OPTIONS`, `TOKEN_KEY` |

## Type Definitions

- Place all domain models and shared types in `src/app/shared/types.ts`
- Prefer **string literal union types** over enums: `type UserRole = 'ADMIN' | 'OPERATOR'`
- Use generic wrapper types where appropriate: `TableDataSource<T>`

## Access Modifiers

- `protected` — for members accessed in the component template
- `private` — for internals not used in the template
- Avoid `public` on class members unless part of a public API

## Environment & Constants

- All backend URLs come from `environment.backendUrl`
- Use the `environment.development.ts` override for local development
- Shared HTTP option objects live in `src/app/shared/utils.ts` — reuse them, don't create new ones

## RxJS

- Subscribe to observables directly in components (no `async` pipe required since components use signals)
- Always provide `{ next, error }` callbacks in `.subscribe()` — never ignore the `error` case
- Unsubscribe via `takeUntilDestroyed()` or `DestroyRef` to prevent memory leaks

## Authentication

- JWT token key is `TOKEN_KEY = 'INVENTORY_TOKEN'` from `src/app/shared/utils.ts`
- Use `AuthService` to read/write token and get logged user info — never access `localStorage` directly for auth
