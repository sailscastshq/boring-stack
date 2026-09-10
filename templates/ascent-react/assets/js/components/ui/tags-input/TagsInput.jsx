import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const ROOT_CLASSES = [
  'flex min-h-11 w-full flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 shadow-sm outline-none transition-colors duration-150',
  'hover:border-gray-400 focus-within:border-gray-950 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-950',
  'data-disabled:cursor-not-allowed data-disabled:bg-gray-100 data-disabled:text-gray-500',
  'data-invalid:border-red-600 data-invalid:focus-within:outline-red-600',
  'dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:border-gray-600 dark:focus-within:border-white dark:focus-within:outline-white dark:data-disabled:bg-gray-900 dark:data-disabled:text-gray-500 dark:data-invalid:border-red-500 dark:data-invalid:focus-within:outline-red-500',
  'motion-reduce:transition-none'
]

const defaultNormalize = (value) => value.trim()
const defaultValidate = () => true

function assignRef(ref, value) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

const TagsInput = forwardRef(function TagsInput(
  {
    value,
    defaultValue = [],
    onChange,
    draft,
    defaultDraft = '',
    onDraftChange,
    onReject,
    name,
    form,
    placeholder = 'Add a tag',
    disabled = false,
    readOnly = false,
    required = false,
    max = Number.POSITIVE_INFINITY,
    normalize = defaultNormalize,
    validate = defaultValidate,
    className,
    onBlur,
    onKeyDown,
    onPaste,
    onCompositionStart,
    onCompositionEnd,
    'aria-invalid': ariaInvalid,
    'data-slot': _dataSlot,
    'data-disabled': _dataDisabled,
    'data-invalid': _dataInvalid,
    ...inputProps
  },
  forwardedRef
) {
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const removeRefs = useRef([])
  const composing = useRef(false)
  const valueControlled = value !== undefined
  const draftControlled = draft !== undefined
  const [localValue, setLocalValue] = useState(defaultValue)
  const [localDraft, setLocalDraft] = useState(defaultDraft)
  const [status, setStatus] = useState('')
  const tags = valueControlled ? value : localValue
  const pending = draftControlled ? draft : localDraft
  const initialValueRef = useRef([...tags])
  const initialDraftRef = useRef(pending)
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  const setInput = useCallback(
    (node) => {
      inputRef.current = node
      assignRef(forwardedRef, node)
    },
    [forwardedRef]
  )

  function announce(message) {
    setStatus('')
    queueMicrotask(() => setStatus(message))
  }

  function setTags(next) {
    if (!valueControlled) setLocalValue(next)
    onChange?.(next)
  }

  function setDraft(next) {
    if (!draftControlled) setLocalDraft(next)
    onDraftChange?.(next)
  }

  function rejection(raw, message) {
    announce(message)
    onReject?.({ value: raw, message })
    return { accepted: false, raw, message }
  }

  function evaluate(raw, currentTags) {
    let tag
    try {
      tag = String(normalize(String(raw)) ?? '').trim()
    } catch {
      return rejection(raw, 'That tag could not be normalized.')
    }

    if (!tag) return { accepted: false, empty: true, raw }
    if (currentTags.length >= max) {
      return rejection(raw, `You can add up to ${max} tags.`)
    }
    if (currentTags.includes(tag)) {
      return rejection(raw, `${tag} is already added.`)
    }

    const result = validate(tag, currentTags)
    if (result !== true) {
      return rejection(
        raw,
        typeof result === 'string' && result
          ? result
          : `${tag} is not a valid tag.`
      )
    }

    return { accepted: true, tag, raw }
  }

  function addCandidates(candidates) {
    const next = [...tags]
    const rejected = []
    const rejectionMessages = []
    const added = []

    for (const candidate of candidates) {
      const result = evaluate(candidate, next)
      if (result.accepted) {
        next.push(result.tag)
        added.push(result.tag)
      } else if (!result.empty && String(candidate).trim()) {
        rejected.push(String(candidate).trim())
        rejectionMessages.push(result.message)
      }
    }

    if (added.length) {
      setTags(next)
      const addition =
        added.length === 1
          ? `${added[0]} added.`
          : `${added.length} tags added.`
      announce(
        rejectionMessages.length
          ? `${addition} ${rejectionMessages.at(-1)}`
          : addition
      )
    } else if (rejectionMessages.length) {
      announce(rejectionMessages.at(-1))
    }
    setDraft(rejected.join(', '))
    return added.length > 0
  }

  function commitDraft() {
    if (disabled || readOnly) return false
    if (!pending.trim()) {
      setDraft('')
      return false
    }
    return addCandidates([pending])
  }

  function removeAt(index, restoreFocus = true) {
    if (disabled || readOnly || index < 0) return
    const next = [...tags]
    const [removed] = next.splice(index, 1)
    if (removed === undefined) return

    setTags(next)
    announce(`${removed} removed.`)
    if (restoreFocus) {
      requestAnimationFrame(() => {
        const controls = rootRef.current?.querySelectorAll(
          '[data-part="remove"]'
        )
        const target =
          controls?.[index] ?? controls?.[index - 1] ?? inputRef.current
        target?.focus()
      })
    }
  }

  function handleInputKeyDown(event) {
    onKeyDown?.(event)
    if (event.defaultPrevented || composing.current || event.isComposing) return

    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitDraft()
    } else if (event.key === 'Backspace' && !pending && tags.length) {
      event.preventDefault()
      removeAt(tags.length - 1, false)
      inputRef.current?.focus()
    } else if (
      event.key === 'ArrowLeft' &&
      event.currentTarget.selectionStart === 0 &&
      tags.length
    ) {
      event.preventDefault()
      removeRefs.current.at(-1)?.focus()
    }
  }

  function handleRemoveKeyDown(event, index) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      ;(removeRefs.current[index - 1] ?? inputRef.current)?.focus()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      ;(removeRefs.current[index + 1] ?? inputRef.current)?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      removeRefs.current[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      inputRef.current?.focus()
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      removeAt(index)
    }
  }

  function handlePaste(event) {
    onPaste?.(event)
    if (event.defaultPrevented || disabled || readOnly) return
    const pasted = event.clipboardData?.getData('text') ?? ''
    if (!/[,\n]/.test(pasted)) return

    event.preventDefault()
    addCandidates(`${pending}${pasted}`.split(/[,\n]+/))
  }

  function handleBlur(event) {
    onBlur?.(event)
    if (!event.defaultPrevented) commitDraft()
  }

  useEffect(() => {
    const owner = inputRef.current?.form
    if (!owner) return

    function handleReset() {
      queueMicrotask(() => {
        const next = [...initialValueRef.current]
        const nextDraft = initialDraftRef.current
        if (!valueControlled) setLocalValue(next)
        if (!draftControlled) setLocalDraft(nextDraft)
        onChange?.(next)
        onDraftChange?.(nextDraft)
      })
    }

    owner.addEventListener('reset', handleReset)
    return () => owner.removeEventListener('reset', handleReset)
  }, [draftControlled, onChange, onDraftChange, valueControlled])

  return (
    <div
      ref={rootRef}
      data-slot="tags-input"
      data-disabled={disabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      className={twMerge(ROOT_CLASSES, className)}
      onClick={(event) => {
        if (event.target === rootRef.current) inputRef.current?.focus()
      }}
    >
      {tags.length > 0 && (
        <ul role="list" data-part="list" className="contents">
          {tags.map((tag, index) => (
            <li
              key={`${tag}-${index}`}
              data-part="tag"
              className="inline-flex min-w-0 items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            >
              <span data-part="tag-label" className="min-w-0 truncate">
                {tag}
              </span>
              {!readOnly && (
                <button
                  ref={(node) => {
                    removeRefs.current[index] = node
                  }}
                  type="button"
                  data-part="remove"
                  disabled={disabled}
                  aria-label={`Remove ${tag}`}
                  className="-mr-1 inline-grid size-6 shrink-0 cursor-pointer place-items-center rounded-sm text-gray-500 outline-none hover:bg-gray-200 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus-visible:outline-white"
                  onClick={() => removeAt(index)}
                  onKeyDown={(event) => handleRemoveKeyDown(event, index)}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 5 10 10M15 5 5 15" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <input
        {...inputProps}
        ref={setInput}
        value={pending}
        placeholder={tags.length ? undefined : placeholder}
        disabled={disabled}
        readOnly={readOnly}
        form={form}
        required={required && tags.length === 0}
        aria-invalid={ariaInvalid}
        data-part="input"
        className="min-h-6 min-w-28 flex-1 border-0 bg-transparent p-0 text-base text-inherit outline-none placeholder:text-gray-500 disabled:cursor-not-allowed dark:placeholder:text-gray-400"
        onChange={(event) => setDraft(event.currentTarget.value)}
        onCompositionStart={(event) => {
          composing.current = true
          onCompositionStart?.(event)
        }}
        onCompositionEnd={(event) => {
          composing.current = false
          setDraft(event.currentTarget.value)
          onCompositionEnd?.(event)
        }}
        onKeyDown={handleInputKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
      />

      {tags.map((tag, index) => (
        <input
          key={`field-${tag}-${index}`}
          type="hidden"
          name={name}
          value={tag}
          form={form}
          disabled={disabled || !name}
        />
      ))}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </span>
    </div>
  )
})

export default TagsInput
