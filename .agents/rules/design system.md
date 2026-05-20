---
trigger: always_on
---

# Design System Rules — SecureGate

## Design Philosophy

SecureGate is a security product. Its UI must communicate trust, clarity, and control. Every design decision must serve the user's ability to complete auth flows quickly and without confusion.

- **Minimal** — no decorative elements that do not serve a function
- **Clear** — labels, errors, and states must be immediately readable
- **Trustworthy** — the visual language must feel safe and professional
- **Accessible** — every interactive element must be keyboard and screen reader navigable
- **Mobile-first** — all flows must work on a 375px viewport before scaling up

---

## Styling Framework

- Use **Tailwind CSS** exclusively — no inline styles, no custom CSS files
- Use Tailwind utility classes only — no `@apply` in production components
- Define colour tokens and spacing in `tailwind.config.ts` — do not hardcode hex values in components

---

## Colour Palette

| Token | Usage | Tailwind Class |
|---|---|---|
| Background | Page background | `bg-zinc-950` |
| Surface | Card / form container | `bg-zinc-900` |
| Border | Input borders, dividers | `border-zinc-700` |
| Primary | CTA buttons, active states | `bg-indigo-600` |
| Primary Hover | Button hover state | `hover:bg-indigo-500` |
| Text Primary | Headings, labels | `text-zinc-50` |
| Text Secondary | Subtitles, hints | `text-zinc-400` |
| Error | Inline error messages | `text-red-400` |
| Success | Success banners | `text-emerald-400` |
| Warning | Expiry notices | `text-amber-400` |

---

## Typography

| Element | Class |
|---|---|
| Page heading | `text-2xl font-semibold text-zinc-50` |
| Form label | `text-sm font-medium text-zinc-300` |
| Body / description | `text-sm text-zinc-400` |
| Inline error | `text-sm text-red-400` |
| Success message | `text-sm text-emerald-400` |
| Link | `text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline` |

---

## Layout

- All auth pages use a **centred card layout**:
  - Full-height page: `min-h-screen flex items-center justify-center`
  - Card: `w-full max-w-md bg-zinc-900 rounded-2xl p-8 border border-zinc-800`
- Dashboard uses a **simple top-nav + content area** layout
- No sidebars in MVP — single column content only
- All forms: `flex flex-col gap-5`
- All form fields: `flex flex-col gap-1.5`

---

## Components

### Input Field

```tsx
<input
  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5
             text-sm text-zinc-50 placeholder:text-zinc-500
             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
             disabled:opacity-50 disabled:cursor-not-allowed"
/>
```

### Primary Button

```tsx
<button
  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold
             text-white hover:bg-indigo-500 focus:outline-none focus:ring-2
             focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900
             disabled:opacity-50 disabled:cursor-not-allowed
             transition-colors duration-150"
>
  {isLoading ? <Spinner /> : 'Button Label'}
</button>
```

### Inline Error Message

```tsx
<p className="text-sm text-red-400" role="alert" aria-live="polite">
  {errorMessage}
</p>
```

### Success Banner

```tsx
<div className="rounded-lg bg-emerald-950 border border-emerald-800 px-4 py-3">
  <p className="text-sm text-emerald-400">{successMessage}</p>
</div>
```

---

## Password Strength Indicator

Shown on the Sign Up page beneath the password field. Updates as the user types.

| Strength | Criteria | Bar Colour |
|---|---|---|
| Weak | Less than 8 characters | `bg-red-500` |
| Fair | 8+ chars, mixed case OR numbers | `bg-amber-500` |
| Strong | 8+ chars, mixed case AND numbers AND special character | `bg-emerald-500` |

```tsx
// Strength bar — three segments, fill based on level
<div className="flex gap-1 mt-1.5">
  <div className={`h-1 flex-1 rounded-full ${level >= 1 ? 'bg-red-500' : 'bg-zinc-700'}`} />
  <div className={`h-1 flex-1 rounded-full ${level >= 2 ? 'bg-amber-500' : 'bg-zinc-700'}`} />
  <div className={`h-1 flex-1 rounded-full ${level >= 3 ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
</div>
<p className="text-xs text-zinc-400 mt-1">{strengthLabel}</p>
```

---

## Loading States

- Every submit button must show a loading state while the request is in flight
- Disable the button and show a spinner — never let the user double-submit
- Use a simple inline SVG spinner:

```tsx
const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white mx-auto" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)
```

---

## Accessibility Rules

- Every `<input>` must have a corresponding `<label>` linked via `htmlFor` / `id`
- Every error message must have `role="alert"` and `aria-live="polite"`
- Every button must have a descriptive label — never just an icon with no text
- Focus rings must be visible — do not suppress `:focus-visible` styles
- Colour contrast must meet WCAG AA minimum — do not use low-contrast text

---

## Mobile Rules

- All layouts are mobile-first — design for 375px, scale up
- No horizontal scrolling on any auth page
- Touch targets minimum 44x44px — apply `min-h-[44px]` to all interactive elements
- Form cards on mobile: remove rounded corners and border, go edge-to-edge below `sm:`

```tsx
// Mobile-responsive card
<div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800
                bg-zinc-900 p-6 sm:p-8">
```