import { forwardRef, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES =
  'inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 object-cover text-sm font-medium text-gray-700 select-none dark:bg-gray-800 dark:text-gray-300'

const Avatar = forwardRef(function Avatar(
  {
    src = '',
    alt,
    children,
    className,
    onError,
    onLoad,
    'data-slot': _dataSlot,
    'data-state': _dataState,
    ...props
  },
  ref
) {
  const [failedSource, setFailedSource] = useState(null)
  const showImage = Boolean(src) && failedSource !== src
  const classes = twMerge(BASE_CLASSES, className)

  useEffect(() => {
    setFailedSource(null)
  }, [src])

  function handleError(event) {
    setFailedSource(src)
    onError?.(event)
  }

  function handleLoad(event) {
    setFailedSource(null)
    onLoad?.(event)
  }

  if (showImage) {
    return (
      <img
        {...props}
        ref={ref}
        data-slot="avatar"
        data-state="image"
        src={src}
        alt={alt}
        className={classes}
        onError={handleError}
        onLoad={handleLoad}
      />
    )
  }

  const {
    loading: _loading,
    decoding: _decoding,
    crossOrigin: _crossOrigin,
    referrerPolicy: _referrerPolicy,
    fetchPriority: _fetchPriority,
    sizes: _sizes,
    srcSet: _srcSet,
    useMap: _useMap,
    isMap: _isMap,
    ...fallbackProps
  } = props
  const hasCallerFallbackSemantics =
    props.role !== undefined ||
    props['aria-label'] !== undefined ||
    props['aria-hidden'] !== undefined
  const fallbackSemantics = hasCallerFallbackSemantics
    ? {}
    : alt
    ? { role: 'img', 'aria-label': alt }
    : { 'aria-hidden': true }

  return (
    <span
      {...fallbackProps}
      {...fallbackSemantics}
      ref={ref}
      data-slot="avatar"
      data-state="fallback"
      className={classes}
    >
      {children}
    </span>
  )
})

export default Avatar
