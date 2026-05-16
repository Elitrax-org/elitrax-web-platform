# UI components

Presentational and shared building blocks following the Ignis design system.

- `ui/` low-level primitives and feedback surfaces.
- `forms/` shared hooks and patterns for client mutations.

## Current primitives

- `ui/button.tsx`: primary, secondary, ghost and danger actions.
- `ui/field.tsx`: wraps label, hint and error rendering for form controls.
- `ui/input.tsx`, `ui/textarea.tsx`, `ui/select.tsx`: shared form controls with Ignis styles.
- `ui/inline-alert.tsx`: compact inline status or error message.
- `ui/empty-state.tsx`: reusable empty state with icon, title and description.
- `ui/skeleton.tsx`: loading placeholders for route `loading.tsx` fallbacks.
- `ui/toast-provider.tsx`: app-level notification stack via `useToast()`.
- `ui/confirm-dialog.tsx`: destructive confirmation dialog.

## Mutation pattern

- Use `forms/use-mutation-action.ts` for client-side POST/PATCH/DELETE flows.
- Prefer `successMessage` + `errorMessage` to keep feedback consistent through toasts.
- Use `onError` to map API errors into RHF field errors when a field or root message is needed.
- Keep `router.refresh()` inside the helper via `refresh: true` unless the flow requires custom navigation.

## Usage guidance

- New CRUD forms should compose `Field` + `Input`/`Textarea`/`Select` + `Button`.
- Destructive actions should use `ConfirmDialog` instead of immediate DELETE requests.
- Empty lists in app routes should use `EmptyState` instead of ad-hoc bordered paragraphs.
- Segment-level `loading.tsx` files should rely on `Skeleton` for visual continuity with the dashboard shell.
