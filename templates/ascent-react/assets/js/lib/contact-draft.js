const key = 'ascent:contact-draft:v1'
export function readContactDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(key))
    if (
      draft?.expiresAt > Date.now() &&
      typeof draft.message === 'string' &&
      typeof draft.topic === 'string'
    )
      return { message: draft.message, topic: draft.topic }
    sessionStorage.removeItem(key)
  } catch {}
  return null
}
export function saveContactDraft({ message, topic }) {
  try {
    if (!message && !topic) sessionStorage.removeItem(key)
    else
      sessionStorage.setItem(
        key,
        JSON.stringify({
          message,
          topic,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000
        })
      )
  } catch {}
}
