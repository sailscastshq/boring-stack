import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'

function acceptedByAttribute(file, accept) {
  const rules = accept
    ?.split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
  if (!rules?.length) return true

  const type = file.type?.toLowerCase() ?? ''
  const name = file.name?.toLowerCase() ?? ''
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule)
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

const FileUpload = forwardRef(function FileUpload(
  {
    value,
    defaultValue = null,
    onChange,
    onReject,
    accept,
    capture,
    multiple = false,
    disabled = false,
    validate = () => true,
    className,
    children,
    'data-slot': _dataSlot,
    'data-state': _dataState,
    'data-dragging': _dataDragging,
    'data-disabled': _dataDisabled,
    ...props
  },
  forwardedRef
) {
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const dragDepth = useRef(0)
  const previewEntriesRef = useRef([])
  const controlled = value !== undefined
  const [localValue, setLocalValue] = useState(defaultValue)
  const [previews, setPreviews] = useState([])
  const [dragging, setDragging] = useState(false)
  const selectedValue = controlled ? value : localValue
  const files = useMemo(() => {
    if (multiple) {
      return Array.isArray(selectedValue)
        ? selectedValue.filter(Boolean)
        : selectedValue
        ? [selectedValue]
        : []
    }
    return selectedValue ? [selectedValue] : []
  }, [multiple, selectedValue])
  const file = multiple ? null : files[0] ?? null
  const previewUrl = previews[0]?.previewUrl ?? ''

  const resetInput = useCallback(() => {
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const setSelection = useCallback(
    (selection) => {
      if (!controlled) setLocalValue(selection)
      onChange?.(selection)
      resetInput()
      return true
    },
    [controlled, onChange, resetInput]
  )

  const reject = useCallback(
    (candidate, reason, message, files) => {
      const detail = { file: candidate ?? null, reason, message }
      if (files) detail.files = files
      onReject?.(detail)
      resetInput()
      return false
    },
    [onReject, resetInput]
  )

  const select = useCallback(
    (selection) => {
      if (disabled) return false
      const candidates = Array.from(selection ?? [])
      if (!candidates.length) return false
      if (!multiple && candidates.length > 1) {
        reject(
          candidates[0],
          'multiple',
          'Choose one file at a time.',
          candidates
        )
        resetInput()
        return false
      }

      const accepted = []
      const current = multiple ? [...files] : []
      for (const candidate of candidates) {
        if (!acceptedByAttribute(candidate, accept)) {
          reject(candidate, 'accept', 'That file type is not accepted.')
          continue
        }

        let result
        try {
          result = validate(candidate, {
            files: [...current, ...accepted],
            multiple
          })
        } catch {
          reject(candidate, 'validate', 'That file could not be validated.')
          continue
        }

        if (result !== true && result !== undefined) {
          reject(
            candidate,
            typeof result === 'object' && result?.reason
              ? result.reason
              : 'validate',
            typeof result === 'string' && result
              ? result
              : typeof result === 'object' && result?.message
              ? result.message
              : 'That file is not valid.'
          )
          continue
        }

        accepted.push(candidate)
      }

      if (!accepted.length) {
        resetInput()
        return false
      }

      return setSelection(multiple ? [...current, ...accepted] : accepted[0])
    },
    [
      accept,
      disabled,
      files,
      multiple,
      reject,
      resetInput,
      setSelection,
      validate
    ]
  )

  const choose = useCallback(() => {
    const input = inputRef.current
    if (disabled || !input) return
    resetInput()
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
        return
      } catch {
        // The native click path covers browsers that restrict showPicker().
      }
    }
    input.click()
  }, [disabled, resetInput])

  const clear = useCallback(() => {
    if (!disabled) setSelection(multiple ? [] : null)
  }, [disabled, multiple, setSelection])

  const remove = useCallback(
    (candidate) => {
      if (disabled) return false
      if (!multiple) return setSelection(null)
      const index = files.findIndex((entry) => Object.is(entry, candidate))
      if (index === -1) return false
      const next = [...files]
      next.splice(index, 1)
      return setSelection(next)
    },
    [disabled, files, multiple, setSelection]
  )

  function hasFiles(event) {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files')
  }

  function handleDragEnter(event) {
    if (disabled || !hasFiles(event)) return
    event.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }

  function handleDragOver(event) {
    if (disabled || !hasFiles(event)) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
    setDragging(true)
  }

  function handleDragLeave(event) {
    if (disabled || !hasFiles(event)) return
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }

  function handleDrop(event) {
    if (!hasFiles(event)) return
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    if (!disabled) select(event.dataTransfer?.files)
  }

  useEffect(() => {
    const remaining = [...previewEntriesRef.current]
    const next = files.map((candidate) => {
      const index = remaining.findIndex((entry) =>
        Object.is(entry.file, candidate)
      )
      if (index !== -1) return remaining.splice(index, 1)[0]
      const canPreview =
        typeof Blob !== 'undefined' &&
        candidate instanceof Blob &&
        typeof URL.createObjectURL === 'function'
      return {
        file: candidate,
        previewUrl: canPreview ? URL.createObjectURL(candidate) : ''
      }
    })
    for (const entry of remaining) {
      if (entry.previewUrl) URL.revokeObjectURL?.(entry.previewUrl)
    }
    previewEntriesRef.current = next
    setPreviews(next)
  }, [files])

  useEffect(
    () => () => {
      for (const entry of previewEntriesRef.current) {
        if (entry.previewUrl) URL.revokeObjectURL?.(entry.previewUrl)
      }
      previewEntriesRef.current = []
    },
    []
  )

  const dropzone = {
    'data-dragging': dragging ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  }
  const api = {
    get file() {
      return file
    },
    get previewUrl() {
      return previewUrl
    },
    get files() {
      return files
    },
    get previews() {
      return previews
    },
    get dragging() {
      return dragging
    },
    choose,
    clear,
    remove,
    get dropzone() {
      return dropzone
    }
  }

  useImperativeHandle(forwardedRef, () => ({
    root: rootRef.current,
    choose,
    clear,
    remove
  }))

  return (
    <div
      {...props}
      ref={rootRef}
      data-slot="file-upload"
      data-state={files.length ? 'ready' : 'empty'}
      data-dragging={dragging ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={className}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        data-part="input"
        accept={accept}
        capture={capture}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => select(event.currentTarget.files)}
      />
      {typeof children === 'function' ? children(api) : children}
    </div>
  )
})

export default FileUpload
