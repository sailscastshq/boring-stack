# Klean UI template migration

All five templates use source from the published `klean-ui@0.0.4` release. Each template includes `UI.md`, a source inventory, and a reviewed artwork manifest so generated applications carry their own maintenance instructions.

Mellow retains its form recipes and visual identity. Ascent replaces Prime/Volt services and controls with Klean source, native HTML, and application recipes. React moves to Tailwind 4 to support the published Klean source while retaining its existing theme configuration. Ascent Vue removes Floating Vue; the focused `@floating-ui/dom` positioning dependency remains for Klean overlays.

See each template's `UI.md` for local Menu/Tooltip lifecycle fixes, direct dependencies, retained artwork, and update commands. The templates do not depend on `klean-ui` at runtime.

## Visual evidence

Captured in Chromium at widths 390 and 1440 with a 1000px viewport height. Auth/profile captures include the full page; dialog captures use the viewport. Before images use the parent main commit. Dark captures explicitly apply the existing `dark` class; the marketing/settings shell retains its existing partial dark styling. A complete visual redesign remains tracked separately in #212.

Native dialogs now have an opaque accessible surface, bounded scrolling, focus return, and named cancellation. Icon strokes change to the Klean vocabulary; inputs and navigation keep the original family sizing. Dead sidebar/dark-toggle components had no consumers and were removed. No missing icon was substituted with a new generic SVG.

| Template/state                     | Before                                                                | After                                                               |
| ---------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| mellow-vue, 390px                  | [Before](klean-ui-evidence/before-mellow-vue-390.png)                 | [After](klean-ui-evidence/after-mellow-vue-390.png)                 |
| mellow-vue, 1440px                 | [Before](klean-ui-evidence/before-mellow-vue-1440.png)                | [After](klean-ui-evidence/after-mellow-vue-1440.png)                |
| mellow-react, 390px                | [Before](klean-ui-evidence/before-mellow-react-390.png)               | [After](klean-ui-evidence/after-mellow-react-390.png)               |
| mellow-react, 1440px               | [Before](klean-ui-evidence/before-mellow-react-1440.png)              | [After](klean-ui-evidence/after-mellow-react-1440.png)              |
| mellow-svelte, 390px               | [Before](klean-ui-evidence/before-mellow-svelte-390.png)              | [After](klean-ui-evidence/after-mellow-svelte-390.png)              |
| mellow-svelte, 1440px              | [Before](klean-ui-evidence/before-mellow-svelte-1440.png)             | [After](klean-ui-evidence/after-mellow-svelte-1440.png)             |
| ascent-vue, 1440px, light          | [Before](klean-ui-evidence/before-ascent-vue-1440-light.png)          | [After](klean-ui-evidence/after-ascent-vue-1440-light.png)          |
| ascent-vue, 390px, light           | [Before](klean-ui-evidence/before-ascent-vue-390-light.png)           | [After](klean-ui-evidence/after-ascent-vue-390-light.png)           |
| ascent-vue, 1440px, light-dialog   | [Before](klean-ui-evidence/before-ascent-vue-1440-light-dialog.png)   | [After](klean-ui-evidence/after-ascent-vue-1440-light-dialog.png)   |
| ascent-vue, 390px, dark-dialog     | [Before](klean-ui-evidence/before-ascent-vue-390-dark-dialog.png)     | [After](klean-ui-evidence/after-ascent-vue-390-dark-dialog.png)     |
| ascent-react, 1440px, light        | [Before](klean-ui-evidence/before-ascent-react-1440-light.png)        | [After](klean-ui-evidence/after-ascent-react-1440-light.png)        |
| ascent-react, 390px, light         | [Before](klean-ui-evidence/before-ascent-react-390-light.png)         | [After](klean-ui-evidence/after-ascent-react-390-light.png)         |
| ascent-react, 1440px, light-dialog | [Before](klean-ui-evidence/before-ascent-react-1440-light-dialog.png) | [After](klean-ui-evidence/after-ascent-react-1440-light-dialog.png) |
| ascent-react, 390px, dark-dialog   | [Before](klean-ui-evidence/before-ascent-react-390-dark-dialog.png)   | [After](klean-ui-evidence/after-ascent-react-390-dark-dialog.png)   |

## Verification

Commands run in every template and in separate standalone copies under `/tmp`, installed with `npm ci` from the committed lockfiles. Standalone copies contain no repository links and use published `inertia-sails@1.5.0` rather than the development adapter overlay.

| Template      | Unit | Functional | Chromium | Lint | Production pages/assets |
| ------------- | ---: | ---------: | -------: | ---- | ----------------------- |
| Mellow Vue    |    5 |          7 |        3 | Pass | Pass                    |
| Mellow React  |    5 |          7 |        3 | Pass | Pass                    |
| Mellow Svelte |    5 |          7 |        3 | Pass | Pass                    |
| Ascent Vue    |    5 |          5 |        6 | Pass | Pass                    |
| Ascent React  |    5 |          7 |        6 | Pass | Pass                    |

```sh
npm ci
npm run lint
npm test
NODE_ENV=production node ../../scripts/smoke-template-production.cjs
npx klean-ui@0.0.4 check
```

The production smoke uses a disposable SQLite database and fixture-only session configuration, loads `/` and `/login`, verifies their linked assets, and fails on build errors. It does not deploy or contact payment/mail providers. The five-template CI matrix runs these lint, test, and production checks independently.

Browser trials cover password reveal and validation associations in all Mellow frameworks; Ascent covers account menus, Escape/focus return, mobile Sheets, select choices, tab-scoped contact drafts, tag deduplication/removal, persisted switches, a single dismissible success notification, avatar previews, and bounded native OTP dialogs. React profile submission now reads the actual Inertia form data and uses its non-chainable `transform` API correctly.

The public `create-sails` downloader is pinned to GitHub `main`, so pre-merge verification uses standalone copies of these branch templates. A public CLI generation smoke remains a post-merge check; this report does not claim the released generator already downloads the unmerged branch.

Klean source checks were reviewed against release 0.0.4. Menu (both Ascent frameworks) and Tooltip (Vue) carry the lifecycle guards listed in each `UI.md`. Other reported differences are formatting/class ordering, reviewed against the release source. Registry imports are relocated by the CLI. No additional runtime or replacement primitive library was introduced.

The Svelte template now explicitly declares TypeScript for Inertia's Svelte preprocessing and uses a Prettier 3-compatible Tailwind plugin. These dependencies were exposed by the standalone install check rather than the repository environment.

Final `klean-ui@0.0.4 check`: all Mellow items are current; Ascent Vue reports the reviewed Menu/Tooltip guards; Ascent React reports the Menu guard plus formatting-only Select/Spinner differences.
