<script>
  import Input from '@/components/ui/input/Input.svelte'
  import WarningTriangle from '@/components/ui/icons/WarningTriangle.svelte'
  let {
    value = $bindable(''),
    label,
    id,
    error = '',
    icon,
    suffix,
    children,
    class: className = '',
    'aria-describedby': describedBy,
    ...props
  } = $props()
  let errorId = $derived(error ? `${id}-error` : undefined)
</script>

<div class="block space-y-1.5">
  <label for={id} class="block text-base font-medium text-gray-900"
    >{label}</label
  >
  <span class="relative block">
    <span
      class="pointer-events-none absolute top-1/2 left-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center"
      >{@render icon?.()}</span
    >
    <Input
      {...props}
      {id}
      bind:value
      class={`placeholder:text-gray block min-h-12 w-full rounded-lg border bg-white py-3 pr-10 pl-11 text-base shadow-none transition-colors placeholder:text-base focus:ring-2 focus:outline-none ${error ? 'border-red-300 bg-red-50/40 text-red-950 focus:border-red-500 focus:ring-red-100' : 'border-gray/50 focus:ring-gray-100'} ${className}`}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={[describedBy, errorId].filter(Boolean).join(' ') ||
        undefined}
    />
    {@render suffix?.()}
  </span>
  {@render children?.()}
  {#if error}
    <p
      id={errorId}
      class="flex max-w-full items-start gap-1.5 text-sm leading-5 break-words text-red-600"
      role="alert"
    >
      <WarningTriangle class="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
    </p>
  {/if}
</div>

<style>
  :global(input::-ms-reveal) {
    display: none;
  }
</style>
