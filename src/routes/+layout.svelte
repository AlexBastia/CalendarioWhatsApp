<script>
import TimeMachine from '$lib/components/timeMachine.svelte';
    
  let { children } = $props();  // 'title' è uno snippet opzionale
  console.log('titolo', children)

</script>


<main>
  {@render children()}
</main>
<TimeMachine/>  