<script>
  import TimeMachine from '$lib/components/timeMachine.svelte';  
  let { children } = $props();  // 'title' è uno snippet opzionale
</script>
<main>
  {@render children()}
</main>
<TimeMachine/>  