<script>
  import { twMerge } from 'tailwind-merge'

  let {
    children,
    class: className,
    'aria-hidden': _ariaHidden,
    role: _role,
    focusable: _focusable,
    tabindex: _tabindex,
    'data-slot': _dataSlot,
    ...props
  } = $props()
</script>

<span
  {...props}
  data-slot="spinner"
  aria-hidden="true"
  class={twMerge(
    [
      'inline-flex size-4 shrink-0 items-center justify-center motion-reduce:animate-none! motion-reduce:**:animate-none! *:size-full',
      children ? '' : 'animate-spin'
    ],
    className
  )}
>
  {#if children}
    {@render children()}
  {:else}
    <svg
      data-slot="spinner-mark"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        stroke-width="2"
        opacity="0.2"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  {/if}
</span>
