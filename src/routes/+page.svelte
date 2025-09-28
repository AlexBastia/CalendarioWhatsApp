<script>
	import NotificationBell from "$lib/components/NotificationBell.svelte";
	import NotificationApiManager from "$lib/components/NotificationApiManager.svelte";

	let {data } = $props();
	console.log("notifiche non lette:", data);

	
</script>

<main>
	<h1>E' TORNATO SVELTEKIT!!!!!!!</h1>
	<ul>
		<li><a href="/note">Note</a></li>
		<li><a href="/calendario">CalenDario</a></li>
		<li><a href="/pomodoro">Pomodoro</a></li>
		<li><a href="/signup">Signup</a></li>
		<li><a href="/login">Login</a></li>
		<li><a href="/logout">Logout</a></li>
	</ul>

	{#if !data.notificationForPom}
		<p>Non ci sono notifiche non lette.</p>
	{:else}
		<NotificationBell data={data}  />
	{/if}
	{#if data.notificationTasks && data.notificationTasks.length > 0}
		<NotificationApiManager data={data.notificationTasks} />
		
	{/if}
</main>

