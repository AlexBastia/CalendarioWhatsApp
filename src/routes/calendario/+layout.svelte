<script>
	import { timingStore } from '$lib/stores/timing.js';
	import { format } from 'date-fns';
	import { previousDayWithOptions } from 'date-fns/fp';
	import Title from '$lib/components/Title.svelte';
	//import { form } from '$app/server';

	let { children } = $props();

	// default to now and reactively update when the store changes
</script>

<main>
	{@render children()}
</main>
