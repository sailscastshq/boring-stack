# UI source ownership

The template uses source installed by the published `klean-ui@0.0.4` CLI. The files in `assets/js/components/ui/` are application code: read, review, and edit them like any other source. `tailwind-merge` keeps caller classes authoritative.

## Adding and updating

Run commands from the generated application directory:

```sh
npx klean-ui@0.0.4 add button --dry-run
npx klean-ui@0.0.4 add icon trash --dry-run
npx klean-ui@0.0.4 check
npx klean-ui@0.0.4 diff button
```

Read the [component documentation](https://docs.sailscasts.com/klean-ui/components/) before adding source. Install only the components and icons the application renders. To adopt a newer release, pin its version, run `check` and `diff`, and review the [update guide](https://docs.sailscasts.com/klean-ui/updating) before `update`. Commit your application changes first; never blindly overwrite local patches.

Keep labels, validation messages, loading copy, business rules, and Tailwind recipes at the call site. Actions are buttons; navigation is an anchor or Inertia Link. Do not introduce a provider, runtime, configuration file, or visual variant API. Interface glyphs come from Klean Icons. The reviewed brand SVG exceptions are recorded in `ui-artwork.json` and enforced by the source audit test.

## Installed source

- **button**: Button.vue
- **icons**: ArrowDown.vue, ArrowRight.vue, ExternalLink.vue, ArrowLeft.vue, CheckCircle.vue, Envelope.vue, Eye.vue, EyeOff.vue, Key.vue, Lock.vue, User.vue, WarningTriangle.vue
- **input**: Input.vue
- **spinner**: Spinner.vue

## Source formatting

The migration also reviewed formatting-only differences (quotes, semicolons, and Tailwind class ordering) introduced by the template formatters. `check` may report those items as locally modified; they do not change behavior. Registry dependency imports are relocated by the CLI when installed. The copied source is excluded from routine formatting to keep subsequent updates reviewable.

## Visual design and customization

Mellow uses warm off-white surfaces, violet actions, restrained serif headings, and a readable system sans-serif for forms. Landing content is organized in ruled sections; profile forms use aligned description and control columns on wide screens. Authentication, recovery, and status pages share the same compact form treatment.

The palette and application-owned recipes live in `assets/css/app.css`. Adjust the `@theme` values and `mellow-shell`, `mellow-primary`, `mellow-auth`, `mellow-workspace`, and `mellow-profile-section` there. These are application classes, not a Klean theme or variant API. Keep primitive overrides at the call site with ordinary Tailwind classes so `tailwind-merge` can resolve them. No external font service is required.

Navigation transitions respect `prefers-reduced-motion`. Keep visible focus, field/error associations, disabled states, and overlay focus return when restyling.

Password visibility and server validation remain with their form components. Credentials are never saved to browser storage. The expired-link action resolves to `auth/link-expired`.

## Page inventory

The shared recipes cover this complete shipped inventory:

- `assets/js/pages/auth/check-email.vue`
- `assets/js/pages/auth/forgot-password.vue`
- `assets/js/pages/auth/link-expired.vue`
- `assets/js/pages/auth/login.vue`
- `assets/js/pages/auth/reset-password.vue`
- `assets/js/pages/auth/signup.vue`
- `assets/js/pages/auth/success.vue`
- `assets/js/pages/dashboard/index.vue`
- `assets/js/pages/dashboard/profile.vue`
- `assets/js/pages/error.vue`
- `assets/js/pages/index.vue`

## Visual verification

`tests/e2e/pages/design.test.js` checks public and account layouts at 390, 768, and 1440 pixels, plus recovery states. To save browser screenshots during the trial:

```sh
DESIGN_SCREENSHOTS=/tmp/template-previews node --test tests/e2e/pages/design.test.js
```

Run `npm run lint`, `npm test`, and a production smoke before shipping changes. The repository stores representative screenshots in `.github/previews/`; the generated application does not need those images at runtime.
