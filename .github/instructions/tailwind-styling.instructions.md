---
description: "Use when creating or modifying any component template or stylesheet. Covers Tailwind CSS priority, when to use utility classes vs SCSS, and host binding patterns."
applyTo: "src/**/*.{component.ts,component.html,component.scss}"
---

# Tailwind CSS Styling Guidelines

## Priority Rule

**Always prefer Tailwind utility classes over custom SCSS.** Tailwind classes are the primary styling tool for all components. Custom SCSS should only be used when a style cannot be expressed with Tailwind utilities.

## Applying Classes in Templates

Use Tailwind classes directly on HTML elements in component templates:

```html
<div class="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md">
	<span class="text-sm font-medium text-gray-700">Label</span>
	<button class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">Action</button>
</div>
```

## Host Element Styling

Use the `host` property in `@Component` for layout classes on the host element — do not target `:host` in SCSS:

```typescript
@Component({
  selector: 'app-example',
  host: { class: 'flex flex-col w-full h-full overflow-hidden' },
  ...
})
```

## When SCSS Is Acceptable

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

## Dynamic Classes

Use Angular class bindings with Tailwind classes for conditional styling:

```html
<!-- Conditional single class -->
<div [class.opacity-50]="isDisabled()">...</div>

<!-- Multiple conditional classes -->
<div [class]="{ 'bg-green-100 text-green-800': isActive(), 'bg-gray-100 text-gray-500': !isActive() }">...</div>
```

## Do Not

- Do not write SCSS for layout, spacing, color, typography, or flexbox/grid — use Tailwind instead
- Do not duplicate Tailwind utility values in SCSS variables (e.g. don't define `$spacing-4: 1rem` when `p-4` exists)
- Do not use inline `style` attributes — use Tailwind classes or, as a last resort, SCSS
- Do not use `styleUrl` to apply component-level styles that could be expressed with Tailwind
