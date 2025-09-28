<script>
    import TaskForm from "$lib/components/taskForm.svelte"; 
	import { Task } from "$lib/models/Task";
    let { data } = $props();
    console.log("task received:", data.task);

</script>

<TaskForm
    formAction="/calendario/task?/saveTask"
    task={data.task}
    deleteAction="/calendario/task?/deleteTask"
/>