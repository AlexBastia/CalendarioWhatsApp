<script>
    import TimeMachine from '$lib/components/timeMachine.svelte';
	import NotificationBell from '$lib/components/NotificationBell.svelte';
    
    let {children} = $props();
</script>

<main>
    {@render children()}
</main>

<TimeMachine/> 