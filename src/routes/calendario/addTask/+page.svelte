<script>
    import TaskForm from "$lib/components/taskForm.svelte"; 
    let { data } = $props(); // Riceve i pomodori caricati dal server
</script>

<h1 class="mb-4">Crea Nuovo Evento</h1>

<TaskForm
    formAction="/calendario?/saveTask"
/>