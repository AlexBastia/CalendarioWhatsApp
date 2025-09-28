<script>
	let { tags, modalId } = $props();
</script>

<button
	type="button"
	class="btn p-0"
	data-bs-toggle="modal"
	data-bs-target={modalId ? '#' + modalId : ''}
	aria-label="Add tag"
>
	{#each tags as tag}
		<span class="badge bg-secondary me-1">{tag.name}</span>
	{/each}
	{#if tags.length === 0}
		<span class="text-muted me-1">Add Tag</span>
	{/if}
	<i class="bi bi-plus-circle"></i>
</button>
