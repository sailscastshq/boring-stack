module.exports = async function (req, res, proceed) {
  if (req.session.partialLogin && req.session.partialLogin.userId) {
    return proceed()
  }
  return res.redirect('/login?mode=password')
}
