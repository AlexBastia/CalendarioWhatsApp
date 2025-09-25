<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { isShared, sharingId, copyText } = $props();
</script>

<div class="dropdown">
	<button
		class="btn fs-2"
		type="button"
		id="dropdownMenuButton1"
		data-bs-toggle="dropdown"
		aria-expanded="false"
		aria-label="Options dropdown"
	>
		<i class="bi bi-three-dots-vertical"></i>
	</button>
	<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
		{#if !isShared}
			<li>
				<!-- Button trigger share modal -->
				<button
					type="button"
					class="dropdown-item"
					data-bs-toggle="modal"
					data-bs-target="#noteShareModal"
				>
					<i class="bi bi-share me-2"></i> Condividi
				</button>
			</li>
		{/if}
		<li>
			<button
				class="dropdown-item"
				type="button"
				onclick={copyText}
				aria-label="copy text to clipboard"
			>
				<i class="bi bi-clipboard me-2"></i> Copia Testo</button
			>
		</li>
		<li>
			<button
				form="noteForm"
				type="submit"
				alt="duplicate"
				name="copy"
				value="true"
				class="dropdown-item"><i class="bi bi-copy me-2"></i> Duplica</button
			>
		</li>
		<li>
			{#if !isShared}
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						return () => {
							goto('/note');
						};
					}}
				>
					<button class="dropdown-item text-danger" type="submit" aria-label="delete note"
						><i class="bi bi-trash me-2"></i> Elimina</button
					>
				</form>
			{:else}
				<form
					method="POST"
					action="?/removeUser"
					use:enhance={() => {
						return () => {
							goto('/note');
						};
					}}
				>
          <input type="hidden" name="id" value={sharingId}>
					<button class="dropdown-item text-danger" type="submit" aria-label="delete note"
						><i class="bi bi-trash me-2"></i> Rimuovi</button
					>
				</form>
			{/if}
		</li>
	</ul>
</div>
