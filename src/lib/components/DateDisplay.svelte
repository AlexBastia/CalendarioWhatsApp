<script>
	import { formatDate } from "../utils/datetime";

    let {date1, date2} = $props() 
</script>

<p class="text-muted fs-6">
    {formatDate(date1)}
    {#if date2}
        | {formatDate(date2)}
    {/if} 
</p>