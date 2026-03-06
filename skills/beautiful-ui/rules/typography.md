---
name: typography
description: Typography patterns with Tailwind CSS — type scale, font stacks, line height, line length, letter spacing, font weight hierarchy, text color hierarchy, responsive type, prose styling, truncation, text wrapping, tabular numbers, and dark mode typography
metadata:
  tags: typography, type-scale, font-stack, line-height, line-length, letter-spacing, font-weight, text-color, prose, truncation, tabular-nums, dark-mode, tailwind
---

# Typography Patterns

Typography creates visual hierarchy — the ability to scan a page and instantly understand what's important, what's secondary, and what's supporting detail. Good typography uses **three levers: size, weight, and color** in combination. Size alone isn't enough.

## Type Scale

Tailwind provides a hand-tuned scale that works for both app UIs and marketing pages:

| Class       | Size            | Use in SaaS apps                      |
| ----------- | --------------- | ------------------------------------- |
| `text-xs`   | 12px (0.75rem)  | Labels, badges, fine print            |
| `text-sm`   | 14px (0.875rem) | Body text, table cells, metadata      |
| `text-base` | 16px (1rem)     | Default body text                     |
| `text-lg`   | 18px (1.125rem) | Lead paragraphs, card titles          |
| `text-xl`   | 20px (1.25rem)  | Section intros, prominent card titles |
| `text-2xl`  | 24px (1.5rem)   | Section headings (h3)                 |
| `text-3xl`  | 30px (1.875rem) | Page headings (h2)                    |
| `text-4xl`  | 36px (2.25rem)  | Page titles (h1)                      |
| `text-5xl`  | 48px (3rem)     | Hero headings (marketing)             |
| `text-6xl`+ | 60px+           | Display text (landing pages)          |

**SaaS recommendation:** For dashboards and app UIs, stick to `text-xs` through `text-3xl`. Reserve `text-4xl` and above for marketing pages and hero sections.

### Typical Page Hierarchy

```html
<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
<h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
<h3 class="text-lg font-medium text-gray-900">Today</h3>
<p class="text-sm text-gray-600">Supporting description text</p>
<span class="text-xs text-gray-500">Metadata or timestamp</span>
```

### Custom Type Scale (Tailwind v4)

```css
@theme {
  --text-tiny: 0.625rem;
  --text-tiny--line-height: 1rem;
}
```

Then use: `<span class="text-tiny">Fine print</span>`.

## Font Stacks

Tailwind's defaults use system fonts — zero network requests, no layout shift, instant rendering:

| Class        | Stack                                       |
| ------------ | ------------------------------------------- |
| `font-sans`  | `ui-sans-serif, system-ui, sans-serif, ...` |
| `font-serif` | `ui-serif, Georgia, Cambria, ...`           |
| `font-mono`  | `ui-monospace, SFMono-Regular, Menlo, ...`  |

### Loading Custom Fonts (Tailwind v4)

```css
/* Place @font-face BEFORE @import "tailwindcss" */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/Inter.woff2') format('woff2');
}

@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}
```

**Font-display:** Use `swap` for text fonts (shows fallback immediately, swaps when loaded). Use `block` for icon fonts. Self-host with WOFF2 format. Variable fonts (single file for all weights) are preferred over multiple weight files.

## Line Height (Leading)

Optimal line height depends on font size — an inverse relationship:

| Context                  | Range    | Tailwind utility                      |
| ------------------------ | -------- | ------------------------------------- |
| Body text (long-form)    | 1.5–1.75 | `leading-normal` to `leading-relaxed` |
| Body text (short, cards) | 1.3–1.5  | `leading-snug` to `leading-normal`    |
| Headings (large text)    | 1.0–1.3  | `leading-none` to `leading-snug`      |
| Small text / captions    | 1.4–1.6  | `leading-normal` to `leading-relaxed` |

```html
<!-- Large heading with tight leading -->
<h1 class="text-4xl font-bold leading-tight">Ship faster with less code</h1>

<!-- Body text with comfortable leading -->
<p class="text-base leading-relaxed">We're building the next generation...</p>

<!-- Combined shorthand (Tailwind v4) -->
<p class="text-base/7">Font size 1rem, line-height calc(var(--spacing) * 7)</p>
<p class="text-sm/6">
  Font size 0.875rem, line-height calc(var(--spacing) * 6)
</p>
```

**Rule:** Small text needs more leading (the eye has less vertical reference). Large text needs less leading (it provides its own visual weight).

## Line Length (Measure)

Optimal reading width is **45–75 characters per line** (66 is the sweet spot). Lines too long cause the eye to lose its place. Lines too short cause choppy reading.

```html
<!-- max-w-prose: 65ch — the single most important utility for readable text -->
<article class="max-w-prose">
  <p>This paragraph will never exceed ~65 characters per line...</p>
</article>

<!-- For different contexts -->
<div class="max-w-lg">
  <!-- 32rem — forms, cards -->
  <div class="max-w-xl">
    <!-- 36rem — content columns -->
    <div class="max-w-2xl">
      <!-- 42rem — wide content -->
      <div class="max-w-prose"><!-- 65ch — optimized for reading --></div>
    </div>
  </div>
</div>
```

**Why `ch` units:** `max-w-prose` uses the `ch` unit (width of the "0" character), so it adapts automatically when you change fonts.

**Use `max-w-prose` for:** help docs, changelogs, blog posts, settings descriptions, any long-form text. For dashboard content, the layout grid usually constrains width, but add `max-w-prose` to description blocks.

## Letter Spacing (Tracking)

| Class              | Value    | Use case                            |
| ------------------ | -------- | ----------------------------------- |
| `tracking-tighter` | -0.05em  | Very large display headings (48px+) |
| `tracking-tight`   | -0.025em | Large headings (30–48px)            |
| `tracking-normal`  | 0em      | Body text (default — don't touch)   |
| `tracking-wider`   | 0.05em   | Uppercase labels, buttons           |
| `tracking-widest`  | 0.1em    | All-caps headings, badges           |

```html
<!-- Uppercase label: ALWAYS add tracking -->
<span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
  Status
</span>

<!-- Large hero heading: tighten tracking -->
<h1 class="text-5xl font-bold tracking-tight">Ship faster with less code</h1>
```

**Rules:**

- **Always add `tracking-wider` or `tracking-widest` to uppercase text.** ALL-CAPS letters are designed to sit next to lowercase; without extra spacing they look cramped.
- **Tighten tracking on large headings.** Default spacing looks too loose at 48px+.
- **Never adjust tracking on body text.** Trust the typeface designer.

## Font Weight Hierarchy

| Class            | Weight | Use in SaaS apps                        |
| ---------------- | ------ | --------------------------------------- |
| `font-normal`    | 400    | Body text                               |
| `font-medium`    | 500    | Slightly emphasized text, labels        |
| `font-semibold`  | 600    | Card titles, nav items, subheadings     |
| `font-bold`      | 700    | Headings, strong emphasis               |
| `font-extrabold` | 800    | Hero headings, primary CTAs (marketing) |

**Avoid `font-thin` (100) and `font-extralight` (200) for anything under 24px** — they become unreadable on low-DPI screens.

### Building Hierarchy with Weight

Weight creates hierarchy **without changing font size**:

```html
<!-- Dashboard stat card: weight + color = hierarchy -->
<div>
  <p class="text-sm font-medium text-gray-500">Monthly Revenue</p>
  <p class="text-3xl font-bold text-gray-900">$24,563.00</p>
  <p class="text-sm font-normal text-gray-500">+12.5% from last month</p>
</div>
```

**De-emphasize secondary content** rather than only emphasizing primary content. Making supporting text lighter/smaller is often more effective than making the heading bigger.

## Text Color Hierarchy

Create three to four levels of text prominence using gray shades:

| Level     | Light mode      | Dark mode            | Use                                |
| --------- | --------------- | -------------------- | ---------------------------------- |
| Primary   | `text-gray-900` | `dark:text-gray-100` | Headings, key data                 |
| Secondary | `text-gray-700` | `dark:text-gray-300` | Body text, descriptions            |
| Tertiary  | `text-gray-500` | `dark:text-gray-400` | Metadata, timestamps, help text    |
| Muted     | `text-gray-400` | `dark:text-gray-500` | Placeholders, disabled, fine print |

```html
<!-- List item with color hierarchy -->
<div class="flex items-center justify-between py-3">
  <div>
    <p class="text-sm font-medium text-gray-900">Invoice #1234</p>
    <p class="text-sm text-gray-500">Acme Corp &middot; Jan 15, 2026</p>
  </div>
  <p class="text-sm font-semibold text-gray-900">$2,500.00</p>
</div>
```

**Don't use pure black (`text-black`) for body text.** Dark gray (`text-gray-900`) feels less harsh and more natural.

## Responsive Typography

### Breakpoint-Based (Standard Approach)

```html
<h1 class="text-2xl font-bold md:text-3xl lg:text-4xl">Page Title</h1>
<p class="text-sm md:text-base">Body text</p>
```

### Fluid Typography with clamp() (No Jumps)

```html
<h1 class="text-[clamp(1.875rem,1.3rem+2.5vw,3.75rem)] font-bold">
  Scales smoothly from 30px to 60px
</h1>
```

### Tailwind v4 Fluid Theme

```css
@theme {
  --text-fluid-lg: clamp(1.25rem, 1rem + 1vw, 2rem);
  --text-fluid-xl: clamp(1.5rem, 1.1rem + 1.5vw, 2.5rem);
  --text-fluid-2xl: clamp(2rem, 1.3rem + 2.5vw, 3.75rem);
}
```

```html
<h1 class="text-fluid-2xl font-bold">Smoothly responsive</h1>
```

**Use `rem` (not `px`) in clamp() so typography respects the user's browser font-size settings.**

**Recommendation:** Breakpoint-based for app/dashboard UIs (simpler, predictable). Fluid for marketing/landing pages (polished feel).

## Prose Styling

The `@tailwindcss/typography` plugin provides beautiful typographic defaults for vanilla HTML content (Markdown, CMS output, rich text):

```css
/* Tailwind v4 */
@plugin "@tailwindcss/typography";
```

```html
<article class="prose lg:prose-lg">
  <h1>Article Title</h1>
  <p>Body text with <a href="#">links</a> and <strong>bold</strong>.</p>
  <ul>
    <li>List items</li>
  </ul>
</article>

<!-- Dark mode -->
<article class="prose dark:prose-invert">...</article>

<!-- Customize elements -->
<article class="prose prose-headings:text-blue-900 prose-a:text-blue-600">
  ...
</article>

<!-- Escape prose styling for custom components -->
<article class="prose">
  <p>Styled by prose...</p>
  <div class="not-prose">
    <div class="grid grid-cols-3 gap-4"><!-- custom layout --></div>
  </div>
  <p>Back to prose...</p>
</article>
```

| Size class | Base font | Use for          |
| ---------- | --------- | ---------------- |
| `prose-sm` | 14px      | Compact contexts |
| `prose`    | 16px      | Default          |
| `prose-lg` | 18px      | Blog posts, docs |
| `prose-xl` | 20px      | Feature articles |

## Truncation and Overflow

### Single-Line Truncation

```html
<p class="truncate">Very long text cut off with an ellipsis...</p>
<td class="max-w-xs truncate">customer-long-email@example.com</td>
```

### Multi-Line Truncation

```html
<!-- Show exactly 2 lines before truncating -->
<p class="line-clamp-2">Preview text constrained to two lines...</p>

<!-- Responsive: more lines on larger screens -->
<p class="line-clamp-2 md:line-clamp-3 lg:line-clamp-none">...</p>
```

## Text Wrapping

| Utility        | Effect                              | Use on                  |
| -------------- | ----------------------------------- | ----------------------- |
| `text-balance` | Evenly distributes across lines     | Headings (max ~6 lines) |
| `text-pretty`  | Prevents orphans (single last word) | Body paragraphs         |
| `text-nowrap`  | Prevents wrapping entirely          | Buttons, badges         |

```html
<!-- Heading: no awkward short last line -->
<h1 class="text-4xl font-bold text-balance">
  The quick brown fox jumps over the lazy dog
</h1>

<!-- Body: no single-word orphan on last line -->
<p class="text-pretty text-gray-600">
  We're building developer tools that make it easier to ship software.
</p>

<!-- Button: never wraps -->
<button class="text-nowrap rounded bg-blue-600 px-4 py-2 text-white">
  Get Started Free
</button>
```

These are progressive enhancements — they gracefully degrade to normal wrapping in unsupported browsers.

## Numbers and Data

### Tabular Numbers

Use `tabular-nums` whenever numbers need to align vertically — prices, stats, tables, counters. Without it, proportional digit widths cause columns to misalign and counters to shift layout on update.

```html
<!-- Pricing table: numbers align vertically -->
<tbody class="tabular-nums">
  <tr>
    <td>Basic</td>
    <td class="text-right">$9.00</td>
  </tr>
  <tr>
    <td>Pro</td>
    <td class="text-right">$29.00</td>
  </tr>
  <tr>
    <td>Enterprise</td>
    <td class="text-right">$199.00</td>
  </tr>
</tbody>

<!-- Dashboard stat (prevents layout shift on updates) -->
<p class="text-4xl font-bold tabular-nums">$10,024.50</p>

<!-- Slashed zero for technical data (0 vs O clarity) -->
<code class="tabular-nums slashed-zero">API key: a0b1c2d3</code>
```

**Important:** Not all fonts support `tabular-nums`. Inter does. If your font doesn't, use `font-mono` as a fallback for data alignment.

### Right-Align Numbers in Tables

```html
<th scope="col" class="text-right">Amount</th>
<td class="text-right tabular-nums">$2,500.00</td>
```

Numbers in table columns should always be right-aligned so decimal places line up.

## Dark Mode Typography

Light text on dark backgrounds needs **less contrast** than dark text on light backgrounds. Pure white on pure black causes eye strain.

| Level     | Light mode      | Dark mode            |
| --------- | --------------- | -------------------- |
| Headings  | `text-gray-950` | `dark:text-white`    |
| Primary   | `text-gray-900` | `dark:text-gray-100` |
| Secondary | `text-gray-700` | `dark:text-gray-300` |
| Tertiary  | `text-gray-500` | `dark:text-gray-400` |

```html
<!-- Dark mode card -->
<div
  class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
>
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Revenue</h3>
  <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">$24,563</p>
  <p class="text-sm text-gray-500 dark:text-gray-400">+12.5% from last month</p>
</div>
```

**Adjust colored text for dark mode:** `text-blue-600` on white passes contrast, but fails on `bg-gray-900`. Use `dark:text-blue-400`.

## Anti-Patterns

1. **Using only font-size for hierarchy** — Combine size, weight, and color. A bold, dark title with light-gray body text creates hierarchy even at similar sizes.

2. **Using heading elements for styling** — Don't use `<h3>` because you want smaller text. Use CSS classes. Heading levels must follow the document outline, not visual size.

3. **Centered paragraphs** — Don't center text longer than 2-3 lines. Left-aligned is more readable for long content.

4. **Justified text without hyphenation** — Creates uneven word spacing. Use `text-left` (the default).

5. **Using `font-thin` for UI text** — Weights below 400 are unreadable at body text sizes on low-DPI screens. De-emphasize with lighter color or smaller size instead.

6. **Pure white text on dark backgrounds** — For body text, `text-gray-100` or `text-gray-200` is more comfortable than `text-white`.
