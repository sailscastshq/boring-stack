<script>
  import InputBase from '@/components/InputBase.svelte'
  import Envelope from '@/components/ui/icons/Envelope.svelte'
  let { value = $bindable(''), ...props } = $props()
</script>

<InputBase
  label="Email"
  id="email"
  type="email"
  placeholder="Your email"
  {...props}
  bind:value
>
  {#snippet icon()}<Envelope class="text-gray h-5 w-5" />{/snippet}
</InputBase>
