<script>
	import { enhance } from '$app/forms';
	import DateDisplay from './DateDisplay.svelte';

	let { item } = $props();
</script>

<div class="list-item d-flex align-items-center justify-content-between ps-2 pe-2">
	<div class="d-flex align-items-center gap-3">
		<div class="content">
			<h2 class="mb-0 text-truncate">{item.descr}</h2>
			{#if item.deadline}
				<div class="deadline small mt-1">
					<DateDisplay date1={item.deadline} detailed={false} />
				</div>
			{/if}
		</div>
	</div>

	<form action="?/removeItem" method="POST" use:enhance>
		<input type="hidden" name="id" value={item._id} />
		<button
			class="btn btn-sm"
			type="submit"
			aria-label="Set item completed"
		>
			<i class="bi bi-circle"></i>
		</button>
	</form>
</div>