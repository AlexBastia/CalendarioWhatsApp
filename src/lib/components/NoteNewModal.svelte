<div class="modal" id="noteNewModal" tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Choose note type</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body d-flex">
				<button class="btn btn-primary flex-fill" form="createNoteForm" type="submit"
					><i class="bi bi-fonts me-2"></i>Text</button
				>
				<button
					class="btn btn-primary flex-fill"
					form="createNoteForm"
					formaction="/note/liste?/create"
					type="submit"><i class="bi bi-list-check me-2"></i>List</button
				>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
			</div>
		</div>
	</div>
</div>
