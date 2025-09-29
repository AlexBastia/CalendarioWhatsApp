<script>
	import { onMount } from 'svelte';
	import { auth } from '$lib/utils/googleAuth.svelte.js';
	import Alert from './Alert.svelte';
	import Loading from './Loading.svelte';

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
			const response = await fetch(
				`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(now)}`,
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			);

			if (!response.ok) {
				throw new Error(`Google API error: ${response.statusText}`);
			}

			const data = await response.json();
			events = data.items || [];
		} catch (e) {
			error = e.message;
			console.error('Failed to fetch calendar events:', e);
		} finally {
			isLoading = false;
		}
		refreshGoogleEvents();
	}

	async function refreshGoogleEvents() {
		await fetch('/calendario?/refreshGoogleEvents', {
			method: 'POST',
			body: JSON.stringify({
				events: events
					.filter((gEvent) => gEvent.start.dateTime && gEvent.end.dateTime)
					.map((gEvent) => {
						return {
							start: gEvent.start.dateTime,
							end: gEvent.end.dateTime,
							title: gEvent.summary,
							note: gEvent.description,
							place: gEvent.location
						};
					})
			})
		});
	}
</script>

{#if isLoading}
	<Loading />	
{:else}
	<button
		class="btn btn-secondary rounded-pill"
		onclick={auth.signIn}
		disabled={!auth.isInitialized}
		aria-label="Sync Google Calendar"
	>
		Sync
	</button>
{/if}
{#if error}
	<Alert type={'warning'} message={error} />
{/if}
