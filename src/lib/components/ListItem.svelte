<script>
    import { enhance } from "$app/forms";

    let {item} = $props()
</script>

<form action="?/removeItem" method="POST" class="d-flex align-items-center" use:enhance>
	<button class="btn" type="submit" name="id" value={item._id} aria-label="Set item completed"
		><i class="bi bi-circle"></i></button
	>
	<h4>{item.descr}</h4>
</form>
