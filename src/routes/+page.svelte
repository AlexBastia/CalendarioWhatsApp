<script>
	import NotificationBell from "$lib/components/NotificationBell.svelte";
	import NotificationApiManager from "$lib/components/NotificationApiManager.svelte";
	import GoogleCalendar from "$lib/components/GoogleCalendar.svelte";
	import Title from "$lib/components/Title.svelte";

	let {data } = $props();
	console.log("notifiche non lette:", data);

	
</script>



<main>
	<Title title={"Cos'è tornato alessio?"}></Title>
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
		<NotificationBell/>
	{/if}
	{#if data.notificationTasks && data.notificationTasks.length > 0}
		<NotificationApiManager data={data.notificationTasks} />
	{/if}

	<GoogleCalendar />
</main>

