<script>
  import Button from '@/components/ui/button/Button.svelte'
  import Spinner from '@/components/ui/spinner/Spinner.svelte'
  let {
    processing = false,
    disabled = false,
    class: className = '',
    children,
    ...props
  } = $props()
</script>

<Button
  type="submit"
  {...props}
  disabled={disabled || processing}
  aria-busy={processing}
  class={`border-brand bg-brand hover:bg-brand active:bg-brand dark:bg-brand dark:hover:bg-brand dark:active:bg-brand disabled:text-gray relative flex items-center justify-center rounded-full border px-4 py-3 text-base font-medium text-white disabled:cursor-not-allowed disabled:border-gray-200/40 disabled:bg-gray-200/40 disabled:opacity-100 dark:text-white ${className}`}
>
  {#if processing}<Spinner class="absolute h-5 w-5 text-white" />{/if}
  <span class:text-transparent={processing}
    >{#if children}{@render children()}{:else}Submit{/if}</span
  >
</Button>
