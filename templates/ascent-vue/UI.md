# UI source ownership

The template uses source installed by the published `klean-ui@0.0.4` CLI. The files in `assets/js/components/ui/` are application code: read, review, and edit them like any other source. `tailwind-merge` keeps caller classes authoritative. `@floating-ui/dom` provides viewport-aware positioning for popovers/selects and tooltips.

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

- **alert**: Alert.vue
- **avatar**: Avatar.vue
- **badge**: Badge.vue
- **button**: Button.vue
- **dialog**: Dialog.vue
- **file-upload**: FileUpload.vue
- **icons**: ArrowRight.vue, Bell.vue, Bolt.vue, Building.vue, Camera.vue, ChartBar.vue, Chat.vue, Check.vue, CheckCircle.vue, ChevronDown.vue, ChevronLeft.vue, Clock.vue, Code.vue, Copy.vue, CreditCard.vue, CurrencyDollar.vue, DocumentText.vue, Edit.vue, EllipsisVertical.vue, Envelope.vue, ExternalLink.vue, Fingerprint.vue, Globe.vue, Heart.vue, InfoCircle.vue, Key.vue, LayoutDashboard.vue, Link.vue, Lock.vue, Newspaper.vue, Plus.vue, Search.vue, Settings.vue, ShieldCheck.vue, SidebarClose.vue, SidebarOpen.vue, SignOut.vue, Trash.vue, User.vue, Users.vue, WarningTriangle.vue, X.vue
- **input**: Input.vue
- **menu**: Menu.vue
- **popover**: Popover.vue
- **select**: Select.vue
- **separator**: Separator.vue
- **sheet**: Sheet.vue
- **spinner**: Spinner.vue
- **switch**: Switch.vue
- **tags-input**: TagsInput.vue
- **textarea**: Textarea.vue
- **toast**: Toast.vue, toast.js
- **tooltip**: Tooltip.vue

## Reviewed local changes

- Menu: return early when the content element has no ID during a sidebar remount. Otherwise an event path entry without an ID can be mistaken for the invoking button.
- Tooltip: skip deferred setup if its root was unmounted during the initial responsive-shell render. This prevents attaching a MutationObserver to a missing node.

`check` should report these source items as modified; inspect their diffs before updating. Application recipes live outside `ui/`: modal titles/footers, confirmation state, password reveal, upload previews, account navigation, and server-flash notifications.

The contact form keeps only its message and topic in tab-scoped session storage for up to 24 hours. Submission clears the draft. Contact identity fields and all authentication forms are excluded. Sidebar collapse retains its existing local preference. OTP is a single native input; desktop navigation is a semantic aside and mobile navigation is a modal Sheet.

## Source formatting

The migration also reviewed formatting-only differences (quotes, semicolons, and Tailwind class ordering) introduced by the template formatters. `check` may report those items as locally modified; they do not change behavior. Registry dependency imports are relocated by the CLI when installed. The copied source is excluded from routine formatting to keep subsequent updates reviewable.
