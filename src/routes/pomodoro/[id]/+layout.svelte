<script>
	import { timingStore } from '$lib/stores/timing.js';
	import { format } from 'date-fns';
	

	let { children } = $props();

	// default to now and reactively update when the store changes
</script>

<style>
.padding-responsive {
  padding-left: auto; 
  padding-right: auto;
}


</style>

<main class="padding-responsive">
	{@render children()}
</main>

