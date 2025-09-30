<script>
	import { timingStore } from '$lib/stores/timing.js';
	import { format } from 'date-fns';
	
	import Title from '$lib/components/Title.svelte';
	//import { form } from '$app/server';

	let { children } = $props();

	// default to now and reactively update when the store changes
</script>

<style>
.padding-responsive {
  padding-left: 12rem; 
  padding-right: 12rem;
}

@media (max-width: 991.98px) {
  .padding-responsive {
    padding-left: 6rem; 
    padding-right: 6rem;
  }
}

@media (max-width: 767.98px) {
  	.padding-responsive {
	  padding-left: 0rem; 
	  padding-right: 0rem;
	}
}

</style>

<main class="padding-responsive">
	{@render children()}
</main>

