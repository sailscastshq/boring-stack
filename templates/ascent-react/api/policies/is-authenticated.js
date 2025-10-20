module.exports = async function (req, res, proceed) {
  if (req.session.userId) return proceed()

  // Store the intended destination in session
  await sails.helpers.returnUrl.set(req)

  // Redirect to login without exposing returnUrl in query params
  return res.redirect('/login')
}
