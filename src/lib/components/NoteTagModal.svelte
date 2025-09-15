<script>
	import { enhance } from '$app/forms';

  let {userTags, noteTags} = $props()
</script>

<div
  class="modal fade"
  id="tagModal"
  data-bs-backdrop="static"
  data-bs-keyboard="false"
  tabindex="-1"
  aria-labelledby="tagModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="tagModalLabel">Categorie</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <form method="POST" action="/note?/createTag" use:enhance>
          <div class="input-group">
            <input type="text" name="tagName" class="form-control" />
            <button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
          </div>
        </form>
        <form
          id="changeTagForm"
          method="POST"
          action="?/updateTags"
          use:enhance={() => {
            return async ({ update }) => update({ reset: false });
          }}
        >
          <div class="list-group list-group-flush">
            {#each userTags as tag (tag._id)}
              <div class="list-group-item d-flex justify-content-between align-items-center">
                <label for={tag._id} class="form-check-label"
                  ><span class="badge bg-secondary fs-6">{tag.name}</span></label
                >
                <input
                  type="checkbox"
                  name={tag._id}
                  checked={noteTags.some((noteTag) => noteTag._id === tag._id)}
                  class="form-check-input"
                />
              </div>
            {/each}
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button form="changeTagForm" type="submit" class="btn btn-primary" data-bs-dismiss="modal"
          >Salva</button
        >
      </div>
    </div>
  </div>
</div>