---
description: "Use when scaffolding a new feature, adding a feature route, or creating feature folders. Covers folder structure, lazy-loaded routing, popup components, and data-access service placement."
---

# Feature Structure Guidelines

## Folder Layout

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

## Route Registration

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

## Types

Domain models for the feature belong in `src/app/shared/types.ts`. Add interfaces there, not in the feature folder.

## Popups

Create/edit/delete dialogs are standalone components opened via `MatDialog`. Use the shared `DefaultDeletePopupComponent` (from `@ferhaps/easy-ui-lib`) for delete confirmations instead of creating a new one.

## Naming

- Feature folder: `kebab-case` (e.g., `purchase-orders`)
- Component class: `PascalCase` + `Component` suffix (e.g., `PurchaseOrdersComponent`)
- Service class: `PascalCase` + `Service` suffix (e.g., `PurchaseOrderService`)
- Popup component class: `AddPurchaseOrderPopupComponent`
