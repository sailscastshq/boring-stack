<script>
  export let value = ''
  export let label
  export let id
</script>

<label for={id} class="relative block">
  <span class="block text-lg">{label}</span>
  <span class="absolute left-2 top-[55%]">
    <slot name="icon"></slot>
  </span>
  <input
    {id}
    class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-10 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
    {...$$restProps}
    bind:value
  />
  <slot></slot>
  <slot name="suffix"></slot>
</label>

<style>
  ::-ms-reveal {
    display: none;
  }
</style>
