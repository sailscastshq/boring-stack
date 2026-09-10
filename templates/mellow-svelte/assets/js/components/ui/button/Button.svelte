<script>
  import { twMerge } from 'tailwind-merge'

  const BASE_CLASSES = [
    'inline-flex min-h-11 min-w-11 cursor-pointer select-none items-center justify-center gap-2 rounded-md no-underline',
    'bg-gray-950 px-4 py-2 text-sm font-medium text-nowrap text-white',
    'transition-colors duration-150 ease-out',
    'hover:bg-gray-800 active:bg-gray-700',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 dark:focus-visible:outline-gray-400',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    'dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 dark:active:bg-gray-200',
    'motion-reduce:transition-none'
  ]

  let {
    as = 'button',
    type = 'button',
    disabled = false,
    class: className,
    onclick,
    onkeydown,
    tabindex,
    'aria-disabled': ariaDisabled,
    children,
    ...props
  } = $props()

  let isNativeButton = $derived(as === 'button')

  function handleClick(event) {
    if (disabled && !isNativeButton) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }

    onclick?.(event)
  }

  function handleKeydown(event) {
    if (disabled && !isNativeButton && ['Enter', ' '].includes(event.key)) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }

    onkeydown?.(event)
  }
</script>

{#if typeof as === 'string'}
  <svelte:element
    this={as}
    {...props}
    type={isNativeButton ? type : undefined}
    disabled={isNativeButton ? disabled : undefined}
    aria-disabled={isNativeButton
      ? undefined
      : disabled
        ? 'true'
        : ariaDisabled}
    tabindex={!isNativeButton && disabled ? -1 : tabindex}
    data-disabled={disabled ? '' : undefined}
    data-slot="button"
    class={twMerge(BASE_CLASSES, className)}
    onclick={handleClick}
    onkeydown={handleKeydown}
  >
    {@render children?.()}
  </svelte:element>
{:else}
  {@const Component = as}
  <Component
    {...props}
    type={undefined}
    disabled={undefined}
    aria-disabled={disabled ? 'true' : ariaDisabled}
    tabindex={disabled ? -1 : tabindex}
    data-disabled={disabled ? '' : undefined}
    data-slot="button"
    class={twMerge(BASE_CLASSES, className)}
    onclick={handleClick}
    onkeydown={handleKeydown}
  >
    {@render children?.()}
  </Component>
{/if}
