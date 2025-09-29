<script>
	import { onMount } from 'svelte';
	import { auth } from '$lib/utils/googleAuth.svelte.js'

	// State for our calendar events
	let events = $state([]);
	let isLoading = $state(false);
	let error = $state(null);

	// Initialize the auth client when the component mounts
	onMount(() => {
		// A short delay to ensure the Google script has loaded
		setTimeout(() => {
			auth.init();
		}, 500);
	});

	// A Svelte 5 effect that runs whenever the sign-in state changes
	$effect(() => {
		if (auth.isSignedIn) {
			fetchCalendarEvents();
		} else {
			// Clear events when user signs out
			events = [];
		}
	});

	async function fetchCalendarEvents() {
		isLoading = true;
		error = null;
		try {
			const now = new Date().toISOString();
			const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(now)}`, {
				headers: {
					'Authorization': `Bearer ${auth.token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Google API error: ${response.statusText}`);
			}

			const data = await response.json();
			events = data.items || [];
		} catch (e) {
			error = e.message;
			console.error("Failed to fetch calendar events:", e);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="calendar-container">
	<h2>Google Calendar Integration</h2>

	{#if auth.isInitialized}
		{#if auth.isSignedIn}
			<div class="user-info">
				{#if auth.profile}
					<p>Welcome, {auth.profile.name}!</p>
				{/if}
				<button onclick={auth.signOut}>Sign Out</button>
			</div>

			<h3>Your Next 10 Events:</h3>
			{#if isLoading}
				<p>Loading events...</p>
			{:else if error}
				<p class="error">Error: {error}</p>
			{:else if events.length > 0}
				<ul>
					{#each events as event (event.id)}
						<li>
							<strong>{event.summary}</strong> - 
							{new Date(event.start.dateTime || event.start.date).toLocaleString()}
						</li>
					{/each}
				</ul>
			{:else}
				<p>No upcoming events found.</p>
			{/if}
		{:else}
			<p>Please sign in to view your calendar events.</p>
			<button onclick={auth.signIn}>Sign In with Google</button>
		{/if}
	{:else}
		<p>Initializing Google Auth...</p>
	{/if}
</div>

<style>
	.calendar-container {
		font-family: sans-serif;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		max-width: 600px;
		margin: 20px auto;
	}
	.user-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}
	button {
		padding: 8px 16px;
		border-radius: 4px;
		border: none;
		background-color: #4285F4;
		color: white;
		cursor: pointer;
	}
	button:hover {
		background-color: #357ae8;
	}
	ul {
		list-style: none;
		padding: 0;
	}
	li {
		background-color: #f9f9f9;
		padding: 10px;
		border-bottom: 1px solid #eee;
	}
	.error {
		color: red;
	}
</style>