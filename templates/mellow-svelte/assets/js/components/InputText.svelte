<script>
  import InputBase from '@/components/InputBase.svelte'
  import User from '@/components/ui/icons/User.svelte'
  let { value = $bindable(''), ...props } = $props()
</script>

<InputBase
  label="Name"
  id="name"
  type="text"
  placeholder="Your name"
  {...props}
  bind:value
>
  {#snippet icon()}<User class="text-gray h-5 w-5" />{/snippet}
</InputBase>
