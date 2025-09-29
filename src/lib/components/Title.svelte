<script>
	let { title, backLink, children } = $props();
</script>

<header class="container d-flex justify-content-between align-items-center">
	<div class="d-flex align-items-center g-3">
		{#if backLink}
			<a href={backLink} aria-label="Go back" class="fs-2 me-5">
				<i class="bi bi-box-arrow-left"></i>
			</a>
		{/if}
		<h1 class="display-2">{title}</h1>
	</div>
	<div class="d-flex align-items-center g-3">
		{@render children?.()}
	</div>
</header>
