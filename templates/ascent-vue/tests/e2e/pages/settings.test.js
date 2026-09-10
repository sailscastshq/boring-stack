const { test } = require('sounding')

test(
  'team owner can open account navigation and cancel a destructive action',
  { browser: true },
  async ({ page, login, expect, sails }) => {
    const user = await sails.models.user
      .create({
        fullName: 'Ascent Tester',
        email: 'navigation@example.com',
        emailStatus: 'verified'
      })
      .fetch()
    const team = await sails.models.team.create({ name: 'Acme Team' }).fetch()
    await sails.models.membership.create({
      member: user.id,
      team: team.id,
      role: 'owner',
      status: 'active'
    })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await login.as(user, page)
    await page.goto('/settings/profile')
    await page.setViewportSize({ width: 1440, height: 1000 })
    await expect(
      page.getByRole('heading', { name: 'Profile', exact: true })
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Account menu', exact: true })
      .first()
      .click()
    await expect(page.getByRole('menu', { name: 'Account menu' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'Account menu', exact: true }).first()
    ).toBeFocused()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Delete', exact: true })
    ).toBeFocused()
    await page.setViewportSize({ width: 390, height: 1000 })
    await page.getByRole('button', { name: /open sidebar/i }).click()
    await expect(
      page.getByRole('dialog', { name: 'Main navigation' })
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('dialog', { name: 'Main navigation' })
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: /open sidebar/i })
    ).toBeFocused()
    expect(errors).toEqual([])
  }
)

test(
  'contact topic selection and a non-sensitive draft survive reload',
  { browser: true },
  async ({ page, expect }) => {
    await page.goto('/contact')
    const topic = page.getByRole('combobox', { name: 'Topic' })
    await topic.focus()
    await page.keyboard.press('Enter')
    await page
      .getByRole('option', { name: 'Technical Support', exact: true })
      .click()
    await expect(topic).toHaveText('Technical Support')
    await expect(topic).toBeFocused()
    const message = page.getByLabel('Message', { exact: true })
    await message.fill('Please help me connect my project.')
    await page.reload()
    await expect(message).toHaveValue('Please help me connect my project.')
    await expect(topic).toHaveText('Technical Support')
  }
)

test(
  'team tags reject duplicates and the invite switch saves its state',
  { browser: true },
  async ({ page, login, expect, sails }) => {
    const user = await sails.models.user
      .create({
        fullName: 'Team Tester',
        email: 'controls@example.com',
        emailStatus: 'verified'
      })
      .fetch()
    const team = await sails.models.team
      .create({ name: 'Control Team', inviteLinkEnabled: true })
      .fetch()
    await sails.models.membership.create({
      member: user.id,
      team: team.id,
      role: 'owner',
      status: 'active'
    })
    await login.as(user, page)
    await page.goto('/settings/team')
    const emails = page.getByRole('textbox', { name: 'Invitation emails' })
    await emails.fill('invite@example.com')
    await emails.press('Enter')
    await expect(
      page.getByRole('button', {
        name: 'Remove invite@example.com',
        exact: true
      })
    ).toHaveCount(1)
    await emails.fill('invite@example.com')
    await emails.press('Enter')
    await expect(
      page.getByRole('button', {
        name: 'Remove invite@example.com',
        exact: true
      })
    ).toHaveCount(1)
    await page
      .getByRole('button', { name: 'Remove invite@example.com', exact: true })
      .click()
    await expect(emails).toBeFocused()
    const toggle = page.getByRole('switch', { name: 'Invite by link' })
    await toggle.focus()
    const saved = page.waitForResponse(
      (response) =>
        response.url().includes('/toggle-invite-link') &&
        response.request().method() === 'POST'
    )
    await toggle.press('Space')
    await saved
    await expect(toggle).not.toBeChecked()
    expect((await sails.models.team.findOne(team.id)).inviteLinkEnabled).toBe(
      false
    )
    await page.reload()
    await expect(toggle).not.toBeChecked()
  }
)

test(
  'profile save announces one dismissible success message',
  { browser: true },
  async ({ page, login, expect, sails }) => {
    const user = await sails.models.user
      .create({
        fullName: 'Profile Tester',
        email: 'profile-ui@example.com',
        emailStatus: 'verified'
      })
      .fetch()
    const team = await sails.models.team
      .create({ name: 'Profile Team' })
      .fetch()
    await sails.models.membership.create({
      member: user.id,
      team: team.id,
      role: 'owner',
      status: 'active'
    })
    await login.as(user, page)
    await page.goto('/settings/profile')
    await page.getByLabel('Full Name', { exact: true }).fill('Updated Tester')
    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click()
    const notice = page
      .locator('[data-slot="toast"]')
      .filter({ hasText: 'Profile updated successfully!' })
    await expect(notice).toHaveCount(1)
    expect((await sails.models.user.findOne(user.id)).fullName).toBe(
      'Updated Tester'
    )
    await notice.locator('[data-slot="toast-dismiss"]').click()
    await expect(notice).toHaveCount(0)
  }
)

test(
  'avatar preview and narrow authenticator setup keep native input behavior',
  { browser: true },
  async ({ page, login, expect, sails }) => {
    const user = await sails.models.user
      .create({
        fullName: 'Security Tester',
        email: 'security-ui@example.com',
        emailStatus: 'verified',
        password: 'correct-horse-battery-staple'
      })
      .fetch()
    const team = await sails.models.team
      .create({ name: 'Security Team' })
      .fetch()
    await sails.models.membership.create({
      member: user.id,
      team: team.id,
      role: 'owner',
      status: 'active'
    })
    await login.as(user, page)
    await page.goto('/settings/profile')
    await page.locator('input[type=file]').setInputFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZxkAAAAASUVORK5CYII=',
        'base64'
      )
    })
    await expect(page.getByAltText('Profile picture')).toHaveAttribute(
      'src',
      /^blob:/
    )
    await page.goto('/settings/security')
    await page
      .getByRole('switch', { name: 'Two-step verification', exact: true })
      .click()
    await page
      .getByRole('button', { name: 'Set up', exact: true })
      .first()
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Authenticator setup',
      exact: true
    })
    await expect(dialog).toBeVisible()
    await page.setViewportSize({ width: 390, height: 700 })
    const code = dialog.getByRole('textbox', { name: 'Verification code' })
    await expect(code).toHaveAttribute('autocomplete', 'one-time-code')
    await expect(code).toHaveAttribute('inputmode', 'numeric')
    await code.fill('123456')
    await expect(code).toHaveValue('123456')
    const rect = await dialog.boundingBox()
    expect(rect.width <= 390 && rect.height <= 700).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  }
)
