<script>
	import { formatDate } from "../utils/datetime";

    let {date1, date2, detailed = true} = $props() 
</script>

<p class="text-muted fs-6 m-0">
    {formatDate(date1, detailed)}
    {#if date2}
        | {formatDate(date2, detailed)}
    {/if} 
</p>