<script>
	import ClickableCard from './ClickableCard.svelte';

	let { preview, userTags, href, mainText } = $props();
</script>

<ClickableCard title={preview.title} {href}>
	<h5 class="card-title">{preview.title || 'No title'}</h5>
	<p class="card-text">{mainText}</p>
	<p class="card-text">
		<small class="text-muted">
			{#each userTags as tag}
				{#if tag.noteIDs.includes(preview._id)}
					<span class="badge bg-secondary me-1">{tag.name}</span>
				{/if}
			{/each}
		</small>
	</p>
</ClickableCard>

<!-- <div class="col"> -->
<!-- 	<div class="card" style="max-width: 400px; min-width: 100px; position: relative;"> -->
<!-- 		<a class="card-link" {href} aria-label="continue reading"></a> -->
<!-- 		<div class="card-body"></div> -->
<!-- 	</div> -->
<!-- </div> -->
