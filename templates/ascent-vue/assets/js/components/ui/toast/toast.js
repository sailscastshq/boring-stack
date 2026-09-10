const DEFAULT_DURATION = 5000
const DEFAULT_MAX = 4
const ENTER_FALLBACK = 500
const LEAVE_FALLBACK = 450

function normalizeDuration(value, fallback) {
  if (value === false || value === 0) return 0

  const duration = Number(value)
  return Number.isFinite(duration) && duration > 0 ? duration : fallback
}

export function createToast({
  duration = DEFAULT_DURATION,
  max = DEFAULT_MAX
} = {}) {
  const listeners = new Set()
  const timers = new Map()
  const lifecycleTimers = new Map()
  const pauseReasons = new Map()
  const globalPauseReasons = new Set()
  let items = []
  let nextId = 0

  function getSnapshot() {
    return items
  }

  function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function publish(nextItems) {
    items = nextItems
    for (const listener of listeners) listener()
  }

  function clearTimer(id) {
    const timer = timers.get(id)
    if (!timer?.timeout) return

    clearTimeout(timer.timeout)
    timer.timeout = null
  }

  function clearLifecycleTimer(id) {
    const timeout = lifecycleTimers.get(id)
    if (timeout) clearTimeout(timeout)
    lifecycleTimers.delete(id)
  }

  function reasonsFor(id) {
    if (!pauseReasons.has(id)) {
      pauseReasons.set(id, new Set(globalPauseReasons))
    }

    return pauseReasons.get(id)
  }

  function schedule(id) {
    const timer = timers.get(id)
    const item = items.find((candidate) => candidate.id === id)

    if (
      !timer ||
      !item ||
      item.state === 'closing' ||
      timer.remaining <= 0 ||
      reasonsFor(id).size > 0
    ) {
      return
    }

    timer.startedAt = Date.now()
    timer.timeout = setTimeout(() => dismiss(id), timer.remaining)
  }

  function resetTimer(id, itemDuration) {
    clearTimer(id)
    timers.delete(id)

    if (!itemDuration) return

    timers.set(id, {
      remaining: itemDuration,
      startedAt: 0,
      timeout: null
    })
    schedule(id)
  }

  function completeEnter(id) {
    clearLifecycleTimer(id)
    const index = items.findIndex((item) => item.id === id)
    if (index === -1 || items[index].state !== 'entering') return false

    const nextItems = [...items]
    nextItems[index] = { ...nextItems[index], state: 'open' }
    publish(nextItems)
    return true
  }

  function remove(id) {
    const exists = items.some((item) => item.id === id)
    if (!exists) return false

    clearTimer(id)
    timers.delete(id)
    clearLifecycleTimer(id)
    pauseReasons.delete(id)
    publish(items.filter((item) => item.id !== id))
    return true
  }

  function dismiss(id) {
    const index = items.findIndex((item) => item.id === id)
    if (index === -1 || items[index].state === 'closing') return false

    clearTimer(id)
    timers.delete(id)
    clearLifecycleTimer(id)

    const nextItems = [...items]
    nextItems[index] = { ...nextItems[index], state: 'closing' }
    publish(nextItems)

    lifecycleTimers.set(
      id,
      setTimeout(() => remove(id), LEAVE_FALLBACK)
    )
    return true
  }

  function pause(id, reason = 'interaction') {
    if (!items.some((item) => item.id === id)) return false

    const reasons = reasonsFor(id)
    if (reasons.has(reason)) return false
    reasons.add(reason)

    const timer = timers.get(id)
    if (timer?.timeout) {
      timer.remaining = Math.max(
        0,
        timer.remaining - (Date.now() - timer.startedAt)
      )
      clearTimer(id)
    }

    return true
  }

  function resume(id, reason = 'interaction') {
    const reasons = pauseReasons.get(id)
    if (!reasons?.has(reason)) return false

    reasons.delete(reason)
    schedule(id)
    return true
  }

  function pauseAll(reason = 'page') {
    globalPauseReasons.add(reason)
    for (const item of items) pause(item.id, reason)
  }

  function resumeAll(reason = 'page') {
    globalPauseReasons.delete(reason)
    for (const item of items) resume(item.id, reason)
  }

  function update(id, patch = {}) {
    const index = items.findIndex((item) => item.id === id)
    if (index === -1 || items[index].state === 'closing') return false

    const current = items[index]
    const itemDuration =
      patch.duration === undefined
        ? current.duration
        : normalizeDuration(patch.duration, duration)
    const nextItems = [...items]

    nextItems[index] = {
      ...current,
      ...patch,
      id,
      duration: itemDuration,
      state: current.state
    }
    publish(nextItems)

    if (patch.duration !== undefined) resetTimer(id, itemDuration)
    return true
  }

  function clear() {
    for (const item of [...items]) dismiss(item.id)
  }

  function destroy() {
    for (const id of [...timers.keys()]) clearTimer(id)
    for (const id of [...lifecycleTimers.keys()]) clearLifecycleTimer(id)
    timers.clear()
    pauseReasons.clear()
    globalPauseReasons.clear()
    items = []
    listeners.clear()
  }

  function notify(input = {}, options = {}) {
    const item =
      typeof input === 'string' ? { ...options, message: input } : { ...input }
    const id = item.id ?? `toast-${++nextId}`
    const existing = items.find(
      (candidate) => candidate.id === id && candidate.state !== 'closing'
    )

    if (existing) {
      update(id, item)
      return id
    }

    const openItems = items.filter((candidate) => candidate.state !== 'closing')
    if (max > 0 && openItems.length >= max) dismiss(openItems[0].id)

    const itemDuration = normalizeDuration(item.duration, duration)
    const nextItem = {
      id,
      title: '',
      message: '',
      class: '',
      ...item,
      duration: itemDuration,
      state: 'entering'
    }

    pauseReasons.set(id, new Set(globalPauseReasons))
    publish([...items, nextItem])
    resetTimer(id, itemDuration)
    lifecycleTimers.set(
      id,
      setTimeout(() => completeEnter(id), ENTER_FALLBACK)
    )
    return id
  }

  Object.assign(notify, {
    clear,
    completeEnter,
    destroy,
    dismiss,
    getSnapshot,
    pause,
    pauseAll,
    remove,
    resume,
    resumeAll,
    subscribe,
    update
  })

  return notify
}

export const toast = createToast()
