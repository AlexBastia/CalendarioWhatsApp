<script>
    import TimeMachine from '$lib/components/timeMachine.svelte';
    
    let {children} = $props();
</script>

<main>
    {@render children()}
</main>

<TimeMachine/>  