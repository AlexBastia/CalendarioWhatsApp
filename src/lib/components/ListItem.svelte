<script>
	import { enhance } from '$app/forms';
	import DateDisplay from './DateDisplay.svelte';

	let { item } = $props();
</script>

<div class="d-flex align-items-center">
	<form action="?/removeItem" method="POST" id="removeItemForm" use:enhance></form>
	<button
		class="btn"
		type="submit"
		form="removeItemForm"
		name="id"
		value={item._id}
		aria-label="Set item completed"><i class="bi bi-circle"></i></button
	>
	<h4>{item.descr}</h4>
	{#if item.deadline}
		<div>
			<DateDisplay date1={item.deadline} detailed={false} />
		</div>
	{/if}
</div>
