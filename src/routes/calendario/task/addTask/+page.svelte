<script>
    import TaskForm from "$lib/components/taskForm.svelte"; 
    let { data } = $props(); 
</script>
<TaskForm
    formAction="/calendario/task?/saveTask"
/>