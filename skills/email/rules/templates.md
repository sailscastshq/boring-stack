---
name: templates
description: EJS email template syntax, template location, naming conventions, shared layout system, responsive design, dark mode, and complete template examples
metadata:
  tags: templates, ejs, layout, layout-email, responsive, dark-mode, html, views, templateData
---

# Email Templates

## Overview

Email templates in The Boring JavaScript Stack are EJS files stored in `views/emails/`. They use a shared layout (`views/layouts/layout-email.ejs`) that provides the outer HTML structure -- header, footer, and responsive styling. Each template provides only the inner content (the email body).

## Template Location and Naming

All email templates live in `views/emails/` and follow the naming convention `email-{purpose}.ejs`:

```
views/
├── layouts/
│   └── layout-email.ejs              # Shared layout (header, footer, styles)
└── emails/
    ├── email-verify-account.ejs      # Account verification
    ├── email-reset-password.ejs      # Password reset
    ├── email-magic-link.ejs          # Magic link sign-in
    ├── email-2fa-login-verification.ejs   # 2FA login code
    ├── email-2fa-setup-verification.ejs   # 2FA setup code
    ├── email-team-invitation.ejs     # Team invitation
    ├── email-verify-new-email.ejs    # Email change verification
    ├── email-contact-form-confirmation.ejs  # Contact form confirmation
    └── email-contact-form-notification.ejs  # Admin notification
```

The `template` parameter in `sails.helpers.mail.send.with()` references the filename without the `.ejs` extension:

```js
template: 'email-verify-account' // -> views/emails/email-verify-account.ejs
template: 'email-reset-password' // -> views/emails/email-reset-password.ejs
```

## EJS Syntax

EJS (Embedded JavaScript) templates use special tags to inject dynamic content:

### `<%= %>` -- Escaped Output

Outputs the value with HTML entities escaped. Use this for user-provided text to prevent XSS:

```ejs
<p>Hi <strong><%= fullName %></strong>, welcome!</p>
```

If `fullName` is `Jane <script>alert('xss')</script>`, it renders as:

```html
<p>
  Hi <strong>Jane &lt;script&gt;alert('xss')&lt;/script&gt;</strong>, welcome!
</p>
```

### `<%- %>` -- Raw (Unescaped) Output

Outputs the value as raw HTML. Use this when you need to inject HTML content:

```ejs
<%- body %>
```

This is used in the layout file to inject the template's HTML content. Do not use `<%-` with user-provided data.

### `<% %>` -- JavaScript Logic

Executes JavaScript without producing output. Use for conditionals, loops, and variable assignments:

```ejs
<% if (showButton) { %>
  <a href="<%= url %>">Click Here</a>
<% } %>

<% const year = new Date().getFullYear() %>
<p>&copy; <%= year %> My App</p>
```

## Template Variables

Variables are passed to templates via the `templateData` parameter:

```js
await sails.helpers.mail.send.with({
  subject: 'Verify your email',
  template: 'email-verify-account',
  to: user.email,
  templateData: {
    token: user.emailProofToken,
    fullName: user.fullName
  }
})
```

Inside the template, `templateData` properties are available as top-level variables:

```ejs
<p>Hi <strong><%= fullName %></strong>, welcome!</p>
<a href="<%= url.resolve(sails.config.custom.baseUrl, '/verify-email') + '?token=' + encodeURIComponent(token) %>">
  Verify Email
</a>
```

### Accessing Sails Globals

The `sails` object is automatically available in all EJS templates. You do not need to pass it through `templateData`. Common uses:

```ejs
<!-- Access config values -->
<%= sails.config.custom.baseUrl %>
<%= sails.config.custom.appName %>

<!-- Use url.resolve for building links (Node.js url module is available) -->
<%= url.resolve(sails.config.custom.baseUrl, '/verify-email') + '?token=' + encodeURIComponent(token) %>

<!-- Current year for copyright -->
<%= new Date().getFullYear() %>
```

### Common templateData Patterns

```js
// Account verification
templateData: {
  token: user.emailProofToken,
  fullName: user.fullName
}

// Password reset
templateData: {
  fullName: user.fullName,
  token: resetToken
}

// Magic link
templateData: {
  token: plainToken,
  fullName: user.fullName,
  email: normalizedEmail,
  magicLinkUrl: `${sails.config.custom.baseUrl}/magic-link/${plainToken}`
}

// 2FA verification code
templateData: {
  fullName: user.fullName,
  verificationCode: '123456',
  userAgent: req.get('User-Agent'),
  ipAddress: req.ip
}

// Team invitation
templateData: {
  teamName: team.name,
  inviterName: inviterUser.fullName,
  email: inviteeEmail,
  inviteUrl: `${sails.config.custom.baseUrl}/team/${invite.token}`,
  expirationDays: 7
}
```

## The Shared Layout: `layout-email.ejs`

The email layout at `views/layouts/layout-email.ejs` wraps every email template. It provides:

- DOCTYPE and `<html>` structure
- `<head>` with meta tags and CSS reset styles
- Responsive design with mobile media queries
- Dark mode support
- Branded header (logo + app name)
- Content area where the template body is injected
- Footer with social links and copyright

### How Body Injection Works

The layout uses `<%- body %>` to inject the template content:

```html
<!-- Inside layout-email.ejs -->
<tr>
  <td style="padding: 0;">
    <div style="padding: 48px 40px 32px 40px;" class="mobile-padding">
      <%- body %>
    </div>
  </td>
</tr>
```

When `sails.helpers.mail.send` is called with `template: 'email-verify-account'`, the hook:

1. Renders `views/emails/email-verify-account.ejs` with the `templateData` variables
2. Takes the rendered HTML and passes it as `body` to `views/layouts/layout-email.ejs`
3. Renders the final complete HTML email

### Complete Layout Example

```html
<!-- views/layouts/layout-email.ejs -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= sails.config.custom.appName || 'My App' %></title>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      /* Reset and base styles */
      body,
      table,
      td,
      a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
      }

      /* Remove default styling */
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
      table {
        border-collapse: collapse !important;
      }
      body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .dark-mode {
          display: block !important;
          max-width: none !important;
          max-height: none !important;
        }
        .light-mode {
          display: none !important;
        }
      }

      /* Mobile responsive */
      @media screen and (max-width: 600px) {
        .mobile-padding {
          padding: 20px !important;
        }
        .mobile-text {
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
        .mobile-button {
          padding: 16px 24px !important;
          font-size: 16px !important;
        }
      }
    </style>
  </head>
  <body
    style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Ubuntu', sans-serif;"
  >
    <!-- Wrapper table for full email -->
    <table
      role="presentation"
      style="width: 100%; border-spacing: 0; border-collapse: collapse; background-color: #f8fafc;"
    >
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <!-- Main email container -->
          <table
            role="presentation"
            style="width: 100%; max-width: 600px; border-spacing: 0; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"
          >
            <!-- Header with branding -->
            <tr>
              <td style="padding: 0;">
                <table
                  role="presentation"
                  style="width: 100%; border-spacing: 0; border-collapse: collapse; background: linear-gradient(135deg, #1e40af 0%, #0891b2 100%); border-radius: 16px 16px 0 0;"
                >
                  <tr>
                    <td align="center" style="padding: 48px 32px;">
                      <div
                        style="display: inline-flex; align-items: center; gap: 12px;"
                      >
                        <!-- Your logo here -->
                        <span
                          style="color: white; font-size: 32px; font-weight: 800; letter-spacing: -1px;"
                          >MY APP</span
                        >
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main content area -->
            <tr>
              <td style="padding: 0;">
                <div
                  style="padding: 48px 40px 32px 40px;"
                  class="mobile-padding"
                >
                  <%- body %>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 0;">
                <div
                  style="background-color: #f8fafc; padding: 32px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;"
                  class="mobile-padding"
                >
                  <table
                    role="presentation"
                    style="width: 100%; border-spacing: 0; border-collapse: collapse;"
                  >
                    <tr>
                      <td align="center">
                        <p
                          style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; line-height: 1.5;"
                        >
                          <strong
                            ><%= sails.config.custom.appName || 'My App'
                            %></strong
                          >
                        </p>
                        <p
                          style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;"
                        >
                          &copy; <%= new Date().getFullYear() %> All rights
                          reserved.<br />
                          Built with The Boring JavaScript Stack.
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## Responsive Email Design

Email HTML is not like web HTML. Email clients (Gmail, Outlook, Apple Mail) all render HTML differently and have limited CSS support. The layout follows these principles:

### Table-Based Layout

Always use `<table>` elements for layout instead of `<div>` elements. Tables render consistently across email clients:

```html
<!-- Good: table-based layout -->
<table
  role="presentation"
  style="width: 100%; border-spacing: 0; border-collapse: collapse;"
>
  <tr>
    <td align="center" style="padding: 40px 20px;">
      <!-- content -->
    </td>
  </tr>
</table>

<!-- Avoid: div-based layout (unreliable in email clients) -->
<div style="display: flex; justify-content: center;">
  <!-- content -->
</div>
```

Always add `role="presentation"` to layout tables so screen readers do not announce them as data tables.

### Inline Styles

Email clients strip `<style>` blocks from `<head>` (Gmail being the main offender). Always use inline styles for critical styling:

```html
<!-- Good: inline styles -->
<p style="margin: 0 0 16px; font-size: 18px; color: #475569; line-height: 1.6;">
  Your text here
</p>

<!-- Bad: relies on <style> block -->
<p class="body-text">Your text here</p>
```

### Maximum Width

Constrain the email container to 600px maximum width. This is the standard for email rendering:

```html
<table role="presentation" style="width: 100%; max-width: 600px;"></table>
```

### Mobile Media Queries

Use CSS media queries in the `<style>` block for mobile adjustments. While Gmail strips them, most other clients support them:

```css
@media screen and (max-width: 600px) {
  .mobile-padding {
    padding: 20px !important;
  }
  .mobile-text {
    font-size: 16px !important;
    line-height: 1.5 !important;
  }
  .mobile-button {
    padding: 16px 24px !important;
    font-size: 16px !important;
  }
}
```

Use `!important` to override inline styles on mobile.

### Button Pattern

Buttons are built with nested `<table>` and `<td>` elements for maximum compatibility:

```html
<table
  role="presentation"
  style="margin: 0 auto 40px; border-spacing: 0; border-collapse: collapse;"
>
  <tr>
    <td
      style="border-radius: 12px; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 0; box-shadow: 0 8px 25px -5px rgba(22, 163, 74, 0.4);"
    >
      <a
        href="<%= actionUrl %>"
        style="display: inline-block; padding: 18px 36px; color: white; text-decoration: none; font-weight: 700; font-size: 18px; border-radius: 12px; letter-spacing: -0.25px;"
      >
        Verify Email Address
      </a>
    </td>
  </tr>
</table>
```

### Font Stack

Use a system font stack since custom web fonts are not reliably supported in email clients:

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
  'Helvetica Neue', 'Ubuntu', sans-serif;
```

## Dark Mode Support

The layout includes a `prefers-color-scheme: dark` media query. Use CSS classes to toggle between light and dark variants:

```css
@media (prefers-color-scheme: dark) {
  .dark-mode {
    display: block !important;
    max-width: none !important;
    max-height: none !important;
  }
  .light-mode {
    display: none !important;
  }
}
```

For simple dark mode, you can target specific elements. Note that dark mode support varies widely across email clients -- Apple Mail and Outlook (Mac) support it well, while Gmail does not.

## Building URLs in Templates

Use `sails.config.custom.baseUrl` combined with `url.resolve()` and `encodeURIComponent()` to build URLs:

### Token-Based Links

```ejs
<!-- Verification link with query parameter -->
<a href="<%= url.resolve(sails.config.custom.baseUrl, '/verify-email') + '?token=' + encodeURIComponent(token) %>">
  Verify Email
</a>

<!-- Password reset link -->
<a href="<%= url.resolve(sails.config.custom.baseUrl, '/reset-password') + '?token=' + encodeURIComponent(token) %>">
  Reset Password
</a>
```

### Pre-Built URLs

For URLs that are more complex, build them in the controller and pass the full URL through `templateData`:

```js
// In the controller
templateData: {
  magicLinkUrl: `${sails.config.custom.baseUrl}/magic-link/${plainToken}`,
  inviteUrl: `${sails.config.custom.baseUrl}/team/${invite.token}`
}
```

```ejs
<!-- In the template -- use the pre-built URL directly -->
<a href="<%= magicLinkUrl %>">Sign in to My App</a>
<a href="<%= inviteUrl %>">Join Team</a>
```

## Complete Template Examples

### Account Verification Email

```html
<!-- views/emails/email-verify-account.ejs -->
<div style="text-align: center;">
  <h1
    style="margin: 0 0 16px; font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px;"
  >
    Welcome to <%= sails.config.custom.appName %>!
  </h1>

  <p
    style="margin: 0 0 40px; font-size: 18px; color: #475569; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;"
  >
    Hi <strong><%= fullName %></strong>, welcome to the team! You're just one
    click away from accessing your account. Please verify your email address to
    get started.
  </p>

  <!-- Verify Email Button -->
  <table
    role="presentation"
    style="margin: 0 auto 40px; border-spacing: 0; border-collapse: collapse;"
  >
    <tr>
      <td
        style="border-radius: 12px; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 0; box-shadow: 0 8px 25px -5px rgba(22, 163, 74, 0.4);"
      >
        <a
          href="<%= url.resolve(sails.config.custom.baseUrl,'/verify-email')+'?token='+encodeURIComponent(token) %>"
          style="display: inline-block; padding: 18px 36px; color: white; text-decoration: none; font-weight: 700; font-size: 18px; border-radius: 12px; letter-spacing: -0.25px;"
        >
          Verify Email Address
        </a>
      </td>
    </tr>
  </table>

  <p
    style="margin: 0 0 32px; font-size: 14px; color: #64748b; line-height: 1.5;"
  >
    This verification link expires in <strong>24 hours</strong>.
  </p>

  <!-- Alternative link -->
  <div
    style="padding: 24px; background-color: #f1f5f9; border-radius: 12px; border: 1px solid #cbd5e1; margin: 32px 0; text-align: left;"
  >
    <p
      style="margin: 0 0 8px; font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;"
    >
      Alternative Access
    </p>
    <p style="margin: 0 0 12px; font-size: 14px; color: #64748b;">
      If the button doesn't work, copy and paste this link:
    </p>
    <p
      style="margin: 0; font-size: 13px; word-break: break-all; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; background-color: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;"
    >
      <a
        href="<%= url.resolve(sails.config.custom.baseUrl,'/verify-email')+'?token='+encodeURIComponent(token) %>"
        style="color: #1e40af; text-decoration: none;"
      >
        <%=
        url.resolve(sails.config.custom.baseUrl,'/verify-email')+'?token='+encodeURIComponent(token)
        %>
      </a>
    </p>
  </div>
</div>
```

### Password Reset Email

```html
<!-- views/emails/email-reset-password.ejs -->
<div style="text-align: center;">
  <h1
    style="margin: 0 0 16px; font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px;"
  >
    Password reset request
  </h1>

  <p
    style="margin: 0 0 40px; font-size: 18px; color: #475569; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;"
  >
    Hi <strong><%= fullName %></strong>, we received a request to reset your
    password. Click the button below to create a new password.
  </p>

  <!-- Reset Password Button -->
  <table
    role="presentation"
    style="margin: 0 auto 40px; border-spacing: 0; border-collapse: collapse;"
  >
    <tr>
      <td
        style="border-radius: 12px; background: linear-gradient(135deg, #1e40af 0%, #0891b2 100%); padding: 0; box-shadow: 0 8px 25px -5px rgba(30, 64, 175, 0.4);"
      >
        <a
          href="<%= url.resolve(sails.config.custom.baseUrl,'/reset-password')+'?token='+encodeURIComponent(token) %>"
          style="display: inline-block; padding: 18px 36px; color: white; text-decoration: none; font-weight: 700; font-size: 18px; border-radius: 12px; letter-spacing: -0.25px;"
        >
          Reset Password
        </a>
      </td>
    </tr>
  </table>

  <p
    style="margin: 0 0 32px; font-size: 14px; color: #64748b; line-height: 1.5;"
  >
    This link expires in <strong>24 hours</strong> and can only be used once.
  </p>

  <!-- Security notice -->
  <div
    style="margin-top: 40px; padding: 20px; background-color: #fef3cd; border: 1px solid #f59e0b; border-radius: 12px; text-align: left;"
  >
    <p
      style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;"
    >
      Security Notice
    </p>
    <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will not be changed.
    </p>
  </div>
</div>
```

### Magic Link Email

```html
<!-- views/emails/email-magic-link.ejs -->
<div style="text-align: center;">
  <h1
    style="margin: 0 0 16px; font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px;"
  >
    Your magic link is ready
  </h1>

  <p
    style="margin: 0 0 40px; font-size: 18px; color: #475569; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;"
  >
    Hi <strong><%= fullName %></strong>, we've got your secure sign-in link
    ready. Click the button below to access your account instantly.
  </p>

  <!-- Magic Link Button -->
  <table
    role="presentation"
    style="margin: 0 auto 40px; border-spacing: 0; border-collapse: collapse;"
  >
    <tr>
      <td
        style="border-radius: 12px; background: linear-gradient(135deg, #1e40af 0%, #0891b2 100%); padding: 0; box-shadow: 0 8px 25px -5px rgba(30, 64, 175, 0.4);"
      >
        <a
          href="<%= magicLinkUrl %>"
          style="display: inline-block; padding: 18px 36px; color: white; text-decoration: none; font-weight: 700; font-size: 18px; border-radius: 12px; letter-spacing: -0.25px;"
        >
          Sign in to <%= sails.config.custom.appName %>
        </a>
      </td>
    </tr>
  </table>

  <p
    style="margin: 0 0 32px; font-size: 14px; color: #64748b; line-height: 1.5;"
  >
    This link expires in <strong>15 minutes</strong> and can only be used once.
  </p>

  <!-- Alternative link -->
  <div
    style="padding: 24px; background-color: #f1f5f9; border-radius: 12px; border: 1px solid #cbd5e1; margin: 32px 0; text-align: left;"
  >
    <p
      style="margin: 0 0 8px; font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;"
    >
      Alternative Access
    </p>
    <p style="margin: 0 0 12px; font-size: 14px; color: #64748b;">
      If the button doesn't work, copy and paste this link:
    </p>
    <p
      style="margin: 0; font-size: 13px; word-break: break-all; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; background-color: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;"
    >
      <a
        href="<%= magicLinkUrl %>"
        style="color: #1e40af; text-decoration: none;"
      >
        <%= magicLinkUrl %>
      </a>
    </p>
  </div>

  <!-- Security notice -->
  <div
    style="margin-top: 40px; padding: 20px; background-color: #fef3cd; border: 1px solid #f59e0b; border-radius: 12px; text-align: left;"
  >
    <p
      style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;"
    >
      Security Notice
    </p>
    <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
      This magic link was requested for <strong><%= email %></strong>. If you
      didn't request this, you can safely ignore this email.
    </p>
  </div>
</div>
```

### 2FA Verification Code Email

```html
<!-- views/emails/email-2fa-login-verification.ejs -->
<div style="text-align: center;">
  <h1
    style="margin: 0 0 16px; font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px;"
  >
    Login Verification Code
  </h1>

  <p
    style="margin: 0 0 40px; font-size: 18px; color: #475569; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;"
  >
    Hi <strong><%= fullName %></strong>, here's your verification code to
    complete your login.
  </p>

  <!-- Verification Code Display -->
  <div
    style="margin: 0 auto 40px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 300px;"
  >
    <p
      style="margin: 0 0 12px; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;"
    >
      Your Login Code
    </p>
    <div
      style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 36px; font-weight: 700; color: #1e40af; letter-spacing: 8px; text-align: center; padding: 16px 24px; background: white; border-radius: 12px; border: 1px solid #cbd5e1; margin: 0 auto;"
    >
      <%= verificationCode %>
    </div>
  </div>

  <p
    style="margin: 0 0 32px; font-size: 14px; color: #64748b; line-height: 1.5;"
  >
    This verification code expires in <strong>10 minutes</strong>.
  </p>

  <!-- Security notice -->
  <div
    style="padding: 24px; background-color: #fef3c7; border-radius: 12px; border: 1px solid #f59e0b; margin: 32px 0; text-align: left;"
  >
    <p
      style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;"
    >
      Security Notice
    </p>
    <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
      If this wasn't you, you can safely ignore this email. We recommend
      changing your password if you're concerned. Never share this code with
      anyone.
    </p>
  </div>

  <!-- Login info -->
  <div
    style="margin-top: 40px; padding: 20px; background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; text-align: left;"
  >
    <p
      style="margin: 0 0 8px; font-size: 14px; color: #0c4a6e; font-weight: 600;"
    >
      Login Information
    </p>
    <p style="margin: 0; font-size: 14px; color: #0c4a6e; line-height: 1.5;">
      Time: <%= new Date().toLocaleString('en-US', { timeZone: 'UTC' }) %>
      UTC<br />
      Browser: <%= userAgent || 'Unknown' %><br />
      IP Address: <%= ipAddress || 'Unknown' %>
    </p>
  </div>
</div>
```

## Creating a New Email Template

Follow these steps to add a new email template:

### Step 1: Create the Template File

```bash
touch views/emails/email-subscription-confirmation.ejs
```

### Step 2: Write the Template Content

```html
<!-- views/emails/email-subscription-confirmation.ejs -->
<div style="text-align: center;">
  <h1
    style="margin: 0 0 16px; font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px;"
  >
    Subscription Confirmed
  </h1>

  <p
    style="margin: 0 0 40px; font-size: 18px; color: #475569; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;"
  >
    Hi <strong><%= fullName %></strong>, thanks for subscribing to the
    <strong><%= planName %></strong> plan!
  </p>

  <div
    style="padding: 24px; background-color: #f0fdf4; border-radius: 12px; border: 1px solid #22c55e; margin: 32px 0; text-align: left;"
  >
    <p
      style="margin: 0 0 8px; font-size: 14px; color: #166534; font-weight: 600;"
    >
      Subscription Details
    </p>
    <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.8;">
      Plan: <strong><%= planName %></strong><br />
      Amount: <strong>$<%= amount %>/month</strong><br />
      Next billing date: <strong><%= nextBillingDate %></strong>
    </p>
  </div>
</div>
```

### Step 3: Send the Email from an Action

```js
await sails.helpers.mail.send.with({
  subject: 'Subscription confirmed',
  template: 'email-subscription-confirmation',
  to: user.email,
  templateData: {
    fullName: user.fullName,
    planName: 'Pro',
    amount: '29',
    nextBillingDate: 'March 10, 2026'
  }
})
```

## Template Design Guidelines

1. **Always include a primary action button** -- Make it obvious what the recipient should do
2. **Add an alternative text link** -- Some email clients block images and buttons; provide a fallback URL as plain text
3. **Include a security notice** -- For sensitive emails (password reset, 2FA, login), tell users to ignore the email if they did not initiate the action
4. **State expiration times** -- If tokens or codes expire, tell the user when
5. **Use `<%= %>` for user data** -- Always escape user-provided content to prevent injection
6. **Keep templates focused** -- Each template should have one clear purpose and one primary action
7. **Use inline styles** -- Do not rely on `<style>` blocks for critical styling
8. **Test in multiple clients** -- Preview emails in Gmail, Outlook, and Apple Mail at minimum
