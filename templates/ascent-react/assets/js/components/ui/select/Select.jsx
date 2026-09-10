import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { twMerge } from 'tailwind-merge'
import Popover from '../popover/Popover.jsx'

function enabledIndexes(options) {
  return options.flatMap((option, index) => (option.disabled ? [] : [index]))
}

function serializedValue(value) {
  return ['string', 'number', 'boolean'].includes(typeof value)
    ? String(value)
    : ''
}

const Select = forwardRef(function Select(
  {
    value: controlledValue,
    defaultValue,
    options = [],
    placeholder = 'Select an option',
    name,
    required = false,
    disabled = false,
    id,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    onValueChange,
    onChange,
    placement = 'bottom-start',
    offset = 4,
    className,
    style,
    renderValue,
    renderOption,
    renderIcon,
    renderEmpty,
    onClick,
    onKeyDown,
    onBlur,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-invalid': ariaInvalid,
    ...triggerProps
  },
  forwardedRef
) {
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const controlId = id ?? `klean-select-${generatedId}`
  const contentId = `${controlId}-content`
  const listboxId = `${controlId}-listbox`
  const triggerRef = useRef(null)
  const rootRef = useRef(null)
  const popoverRef = useRef(null)
  const typeahead = useRef('')
  const typeaheadTimer = useRef()
  const pendingEdge = useRef('selected')
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [triggerWidth, setTriggerWidth] = useState(0)
  const isValueControlled = controlledValue !== undefined
  const currentValue = isValueControlled ? controlledValue : internalValue
  const isOpenControlled = controlledOpen !== undefined
  const isOpen = isOpenControlled ? controlledOpen : internalOpen
  const selectedIndex = options.findIndex((option) =>
    Object.is(option.value, currentValue)
  )
  const selectedOption = options[selectedIndex]
  const activeDescendant =
    isOpen && highlightedIndex >= 0
      ? `${controlId}-option-${highlightedIndex}`
      : undefined
  const groups = useMemo(() => {
    const grouped = new Map()

    options.forEach((option, index) => {
      const label = option.group ?? null
      if (!grouped.has(label)) grouped.set(label, [])
      grouped.get(label).push({ option, index })
    })

    return [...grouped].map(([label, entries]) => ({ label, entries }))
  }, [options])

  const clearTypeahead = useCallback(() => {
    typeahead.current = ''
    clearTimeout(typeaheadTimer.current)
    typeaheadTimer.current = undefined
  }, [])

  const initialHighlight = useCallback(
    (edge = 'selected') => {
      const enabled = enabledIndexes(options)
      if (!enabled.length) return -1
      if (
        edge === 'selected' &&
        selectedIndex >= 0 &&
        !options[selectedIndex]?.disabled
      ) {
        return selectedIndex
      }
      return edge === 'last' ? enabled.at(-1) : enabled[0]
    },
    [options, selectedIndex]
  )

  const syncTriggerWidth = useCallback(() => {
    setTriggerWidth(triggerRef.current?.getBoundingClientRect().width ?? 0)
  }, [])

  const revealHighlighted = useCallback((index) => {
    if (index < 0) return
    queueMicrotask(() => {
      popoverRef.current?.content
        ?.querySelector?.(`[data-option-index="${index}"]`)
        ?.scrollIntoView?.({ block: 'nearest' })
    })
  }, [])

  const requestOpen = useCallback(
    (nextOpen) => {
      if (!isOpenControlled) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isOpenControlled, onOpenChange]
  )

  const openSelect = useCallback(
    (edge = 'selected') => {
      if (disabled) return
      pendingEdge.current = edge
      syncTriggerWidth()

      if (isOpen) {
        const next = initialHighlight(edge)
        setHighlightedIndex(next)
        revealHighlighted(next)
      } else {
        popoverRef.current?.open(triggerRef.current)
      }
    },
    [disabled, initialHighlight, isOpen, revealHighlighted, syncTriggerWidth]
  )

  const closeSelect = useCallback(({ restoreFocus = false } = {}) => {
    popoverRef.current?.close({ restoreFocus })
  }, [])

  const choose = useCallback(
    (index, { close = true } = {}) => {
      const option = options[index]
      if (!option || option.disabled || disabled) return

      if (!isValueControlled) setInternalValue(option.value)
      onValueChange?.(option.value, option)
      onChange?.(option.value, option)
      setHighlightedIndex(index)
      clearTypeahead()
      if (close) closeSelect({ restoreFocus: true })
    },
    [
      clearTypeahead,
      closeSelect,
      disabled,
      isValueControlled,
      onChange,
      onValueChange,
      options
    ]
  )

  const findTypeaheadMatch = useCallback(
    (text) => {
      const enabled = enabledIndexes(options)
      if (!enabled.length) return -1
      const current = enabled.indexOf(isOpen ? highlightedIndex : selectedIndex)
      const ordered = [
        ...enabled.slice(current + 1),
        ...enabled.slice(0, current + 1)
      ]
      return (
        ordered.find((index) =>
          String(options[index]?.label ?? '')
            .trim()
            .toLocaleLowerCase()
            .startsWith(text)
        ) ?? -1
      )
    },
    [highlightedIndex, isOpen, options, selectedIndex]
  )

  const handleTypeahead = useCallback(
    (event) => {
      if (
        event.key.length !== 1 ||
        event.key === ' ' ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return false
      }

      event.preventDefault()
      clearTimeout(typeaheadTimer.current)
      typeahead.current += event.key.toLocaleLowerCase()
      typeaheadTimer.current = setTimeout(clearTypeahead, 500)
      let match = findTypeaheadMatch(typeahead.current)

      if (match < 0 && new Set(typeahead.current).size === 1) {
        typeahead.current = typeahead.current.at(-1)
        match = findTypeaheadMatch(typeahead.current)
      }

      if (match < 0) return true
      if (isOpen) {
        setHighlightedIndex(match)
        revealHighlighted(match)
      } else {
        choose(match, { close: false })
      }
      return true
    },
    [choose, clearTypeahead, findTypeaheadMatch, isOpen, revealHighlighted]
  )

  const moveHighlight = useCallback(
    (step) => {
      const enabled = enabledIndexes(options)
      if (!enabled.length) return
      const current = enabled.indexOf(highlightedIndex)
      const position =
        current < 0
          ? step > 0
            ? 0
            : enabled.length - 1
          : (current + step + enabled.length) % enabled.length
      const next = enabled[position]
      setHighlightedIndex(next)
      revealHighlighted(next)
    },
    [highlightedIndex, options, revealHighlighted]
  )

  function handleKeydown(event) {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return

    if (!isOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        openSelect(event.key === 'ArrowUp' ? 'last' : 'selected')
      } else {
        handleTypeahead(event)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeSelect({ restoreFocus: true })
    } else if (event.key === 'Tab') {
      clearTypeahead()
      closeSelect()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveHighlight(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveHighlight(-1)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const next = initialHighlight(event.key === 'End' ? 'last' : 'first')
      setHighlightedIndex(next)
      revealHighlighted(next)
    } else if (['Enter', ' '].includes(event.key)) {
      event.preventDefault()
      if (highlightedIndex >= 0) choose(highlightedIndex)
    } else {
      handleTypeahead(event)
    }
  }

  useEffect(() => {
    clearTypeahead()
    if (!isOpen) {
      setHighlightedIndex(-1)
      return
    }

    const next = initialHighlight(pendingEdge.current)
    pendingEdge.current = 'selected'
    setHighlightedIndex(next)
    syncTriggerWidth()
    revealHighlighted(next)
  }, [
    clearTypeahead,
    initialHighlight,
    isOpen,
    revealHighlighted,
    syncTriggerWidth
  ])

  useEffect(() => {
    if (!isOpen) return
    const next = initialHighlight('selected')
    setHighlightedIndex(next)
    revealHighlighted(next)
  }, [initialHighlight, isOpen, options, revealHighlighted])

  useEffect(() => {
    const form = rootRef.current?.closest?.('form')
    const handleReset = () => {
      if (!isValueControlled) setInternalValue(defaultValue)
      if (isOpen) closeSelect()
    }
    form?.addEventListener('reset', handleReset)

    const observer =
      typeof ResizeObserver !== 'undefined' && triggerRef.current
        ? new ResizeObserver(syncTriggerWidth)
        : undefined
    if (triggerRef.current) observer?.observe(triggerRef.current)
    syncTriggerWidth()

    return () => {
      clearTypeahead()
      observer?.disconnect()
      form?.removeEventListener('reset', handleReset)
    }
  }, [
    clearTypeahead,
    closeSelect,
    defaultValue,
    isOpen,
    isValueControlled,
    syncTriggerWidth
  ])

  useImperativeHandle(
    forwardedRef,
    () => ({
      close: closeSelect,
      focus: (focusOptions) => triggerRef.current?.focus(focusOptions),
      open: openSelect,
      trigger: triggerRef.current
    }),
    [closeSelect, openSelect]
  )

  return (
    <span
      ref={rootRef}
      data-slot="select"
      data-state={isOpen ? 'open' : 'closed'}
      data-placeholder={selectedOption ? undefined : ''}
      data-disabled={disabled ? '' : undefined}
      data-invalid={
        ariaInvalid === true || ariaInvalid === 'true' ? '' : undefined
      }
      className="relative grid w-full"
    >
      <button
        {...triggerProps}
        ref={triggerRef}
        id={controlId}
        type="button"
        role="combobox"
        disabled={disabled}
        popoverTarget={contentId}
        popoverTargetAction="toggle"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-invalid={ariaInvalid}
        aria-expanded={String(isOpen)}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={activeDescendant}
        aria-required={required || undefined}
        data-slot="select-trigger"
        data-state={isOpen ? 'open' : 'closed'}
        data-placeholder={selectedOption ? undefined : ''}
        className={twMerge(
          'aria-invalid:border-red-600 aria-invalid:focus-visible:outline-red-600 dark:aria-invalid:border-red-500 dark:aria-invalid:focus-visible:outline-red-500 flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-base text-gray-950 shadow-sm outline-none transition-colors duration-150 hover:border-gray-400 focus-visible:border-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:border-gray-600 dark:focus-visible:border-white dark:focus-visible:outline-white dark:disabled:bg-gray-900 dark:disabled:text-gray-500',
          className
        )}
        style={style}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          if (!isOpen) pendingEdge.current = 'selected'
          syncTriggerWidth()
        }}
        onKeyDown={handleKeydown}
        onBlur={onBlur}
      >
        <span
          data-slot="select-value"
          className={
            selectedOption
              ? 'truncate'
              : 'truncate text-gray-500 dark:text-gray-400'
          }
        >
          {selectedOption
            ? renderValue?.(selectedOption) ?? selectedOption.label
            : placeholder}
        </span>

        <span
          data-slot="select-icon"
          className="shrink-0 text-gray-500 dark:text-gray-400"
        >
          {renderIcon?.(isOpen) ?? (
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-4"
            >
              <path
                d="m6 8 4 4 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </button>

      {name ? (
        <input
          type="hidden"
          name={name}
          value={serializedValue(currentValue)}
          disabled={disabled}
          form={triggerProps.form}
        />
      ) : null}

      <Popover
        ref={popoverRef}
        id={contentId}
        open={isOpen}
        placement={placement}
        offset={offset}
        data-slot="select-content"
        className="max-h-72 overflow-hidden p-1"
        style={triggerWidth ? { minWidth: `${triggerWidth}px` } : undefined}
        onOpenChange={requestOpen}
      >
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={ariaLabel ? undefined : ariaLabelledby ?? controlId}
          aria-label={ariaLabel ? `${ariaLabel} options` : undefined}
          data-slot="select-listbox"
          className="max-h-68 overflow-y-auto overscroll-contain outline-none"
        >
          {options.length ? (
            groups.map((group, groupIndex) => (
              <div
                key={group.label ?? `ungrouped-${groupIndex}`}
                role={group.label ? 'group' : undefined}
                aria-label={group.label || undefined}
                data-slot="select-group"
              >
                {group.label ? (
                  <p
                    data-slot="select-group-label"
                    className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    {group.label}
                  </p>
                ) : null}

                {group.entries.map(({ option, index }) => (
                  <div
                    id={`${controlId}-option-${index}`}
                    key={index}
                    role="option"
                    aria-label={String(option.label)}
                    aria-selected={String(index === selectedIndex)}
                    aria-disabled={option.disabled || undefined}
                    data-slot="select-option"
                    data-option-index={index}
                    data-highlighted={
                      index === highlightedIndex ? '' : undefined
                    }
                    data-selected={index === selectedIndex ? '' : undefined}
                    data-disabled={option.disabled ? '' : undefined}
                    className="data-highlighted:bg-gray-100 data-highlighted:text-gray-950 data-disabled:cursor-not-allowed data-disabled:opacity-40 dark:data-highlighted:bg-white/10 dark:data-highlighted:text-white flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded px-3 py-2 text-sm text-gray-700 outline-none dark:text-gray-200"
                    onPointerMove={() => {
                      if (!option.disabled) setHighlightedIndex(index)
                    }}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => choose(index)}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {renderOption?.(option, {
                        selected: index === selectedIndex,
                        highlighted: index === highlightedIndex
                      }) ?? option.label}
                    </span>
                    <span
                      data-slot="select-indicator"
                      className="grid size-5 shrink-0 place-items-center"
                      aria-hidden="true"
                    >
                      {index === selectedIndex ? (
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="size-4"
                        >
                          <path
                            d="m5 10 3 3 7-7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div
              data-slot="select-empty"
              className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              {renderEmpty?.() ?? 'No options available.'}
            </div>
          )}
        </div>
      </Popover>
    </span>
  )
})

export default Select
