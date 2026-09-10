# UI source ownership

The template uses source installed by the published `klean-ui@0.0.4` CLI. The files in `assets/js/components/ui/` are application code: read, review, and edit them like any other source. `tailwind-merge` keeps caller classes authoritative. `@floating-ui/dom` provides viewport-aware positioning for popovers/selects.

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

- **alert**: Alert.jsx
- **avatar**: Avatar.jsx
- **badge**: Badge.jsx
- **button**: Button.jsx
- **dialog**: Dialog.jsx
- **file-upload**: FileUpload.jsx
- **icons**: ArrowRight.jsx, Bell.jsx, Bolt.jsx, Building.jsx, Camera.jsx, ChartBar.jsx, Chat.jsx, Check.jsx, CheckCircle.jsx, ChevronDown.jsx, ChevronLeft.jsx, Clock.jsx, Code.jsx, Copy.jsx, CreditCard.jsx, CurrencyDollar.jsx, DocumentText.jsx, Edit.jsx, EllipsisVertical.jsx, Envelope.jsx, ExternalLink.jsx, Eye.jsx, EyeOff.jsx, Fingerprint.jsx, Globe.jsx, Heart.jsx, InfoCircle.jsx, Key.jsx, LayoutDashboard.jsx, Link.jsx, Lock.jsx, Menu.jsx, Newspaper.jsx, Plus.jsx, Search.jsx, Settings.jsx, ShieldCheck.jsx, SidebarClose.jsx, SidebarOpen.jsx, SignOut.jsx, Trash.jsx, User.jsx, Users.jsx, WarningTriangle.jsx, X.jsx
- **input**: Input.jsx
- **menu**: Menu.jsx
- **popover**: Popover.jsx
- **select**: Select.jsx
- **separator**: Separator.jsx
- **sheet**: Sheet.jsx
- **spinner**: Spinner.jsx
- **switch**: Switch.jsx
- **tags-input**: TagsInput.jsx
- **textarea**: Textarea.jsx
- **toast**: Toast.jsx, toast.js

## Reviewed local changes

- Menu: return early when the content element has no ID during a sidebar remount. Otherwise an event path entry without an ID can be mistaken for the invoking button.

`check` should report these source items as modified; inspect their diffs before updating. Application recipes live outside `ui/`: modal titles/footers, confirmation state, password reveal, upload previews, account navigation, and server-flash notifications.

The contact form keeps only its message and topic in tab-scoped session storage for up to 24 hours. Submission clears the draft. Contact identity fields and all authentication forms are excluded. Sidebar collapse retains its existing local preference. OTP is a single native input; desktop navigation is a semantic aside and mobile navigation is a modal Sheet.

## Source formatting

The migration also reviewed formatting-only differences (quotes, semicolons, and Tailwind class ordering) introduced by the template formatters. `check` may report those items as locally modified; they do not change behavior. Registry dependency imports are relocated by the CLI when installed. The copied source is excluded from routine formatting to keep subsequent updates reviewable.
