<script>
  import InputBase from '@/components/InputBase.svelte'
  import Button from '@/components/ui/button/Button.svelte'
  import Lock from '@/components/ui/icons/Lock.svelte'
  import Eye from '@/components/ui/icons/Eye.svelte'
  import EyeOff from '@/components/ui/icons/EyeOff.svelte'
  let { value = $bindable(''), children, ...props } = $props()
  let showPassword = $state(false)
</script>

<InputBase
  label="Password"
  id="password"
  placeholder="Your password"
  {...props}
  type={showPassword ? 'text' : 'password'}
  bind:value
>
  {#snippet icon()}<Lock class="text-gray h-5 w-5" />{/snippet}
  {#snippet suffix()}
    <span class="absolute top-1/2 right-3 -translate-y-1/2">
      <Button
        type="button"
        onclick={() => (showPassword = !showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        class="min-h-5 min-w-5 rounded-sm bg-transparent p-0 hover:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:active:bg-transparent"
      >
        {#if showPassword}<EyeOff class="text-gray h-5 w-5" />{:else}<Eye
            class="text-gray h-5 w-5"
          />{/if}
      </Button>
    </span>
  {/snippet}
  {@render children?.()}
</InputBase>
