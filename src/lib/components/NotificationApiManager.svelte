<!-- src/lib/components/NotificationApiManager.svelte -->
<script>
    import { onMount } from 'svelte';
    import { initNotifiche, showNotificationsFromData } from '$lib/utils/notification.js';
    console.log('wejfwe')

    let { data } = $props();

    console.log("NotificationApiManager data:", data);

    onMount(async () => {
        // Inizializza le notifiche
        const canNotify = await initNotifiche();
        
        showNotificationsFromData(data);
    });
</script>