<script>
	import NotificationBell from "$lib/components/NotificationBell.svelte";

	let {unreadNotifications, notificationTasks} = $props();
	console.log("notifiche non lette:", unreadNotifications);

	// Dice che non e' iterabile
	// for (const notification of notificationTasks){
		
	// }
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

	<NotificationBell {unreadNotifications}></NotificationBell>
</main>

