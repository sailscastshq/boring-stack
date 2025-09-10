module.exports = async function (req, res, proceed) {
  if (req.session.userId) return proceed()

  // Build login URL with returnUrl parameter
  const returnUrl = req.url
  const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`

  return res.redirect(loginUrl)
}
