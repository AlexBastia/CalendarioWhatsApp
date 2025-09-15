<script>
  import { enhance } from "$app/forms";
</script>

<div
	class="modal fade"
	id="listItemModal"
	tabindex="-1"
	aria-labelledby="listItemModalLabel"
	aria-hidden="true"
	data-bs-backdrop="static"
	data-bs-keyboard="false"
>
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5" id="listItemModalLabel">Elemento lista</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<form action="?/addItem" method="POST" id="listItemForm" use:enhance>
					<input type="text" placeholder="Descrizione" name="descr" />
				</form>
			</div>
			<div class="modal-footer">
				<button form="listItemForm" type="submit" class="btn btn-primary" data-bs-dismiss="modal"
					>Add</button
				>
			</div>
		</div>
	</div>
</div>
