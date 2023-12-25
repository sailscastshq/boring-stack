<script>
  let count = 0
</script>

<button
  on:click={() => (count += 1)}
 class="rounded-lg border border-purple-500 px-4 py-2 text-sm text-gray-600 hover:border-purple-600"
>
  Clicked {count} times</button
>
