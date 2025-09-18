<script>
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	console.log("pera zio")

	onMount(()=>{
		console.log("zio pera")
	});
	//TODO: capisci cosa fa sta roba
	//export let form;
	let { form } = $props();
</script>

<div class="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
	<div class="row w-100 justify-content-center">
		<div class="col-12 col-sm-8 col-md-6 col-lg-4">
			<div class="card shadow-lg border-0">
				<div class="card-body p-5">
					<div class="text-center mb-4">
						<h1 class="card-title h3 text-primary fw-bold">Sign in</h1>
						<p class="text-muted small">
							Welcome back! Please sign in to your account.
						</p>
					</div>
					
					<form method="post" use:enhance>
						<div class="mb-3">
							<label for="form-login.email" class="form-label">
								<i class="bi bi-envelope-fill me-2"></i>Email
							</label>
							<input
								type="email"
								id="form-login.email"
								name="email"
								class="form-control form-control-lg"
								autocomplete="username"
								required
								value={form?.email ?? ''}
								placeholder="Enter your email"
							/>
						</div>
						
						<div class="mb-4">
							<label for="form-login.password" class="form-label">
								<i class="bi bi-lock-fill me-2"></i>Password
							</label>
							<input
								type="password"
								id="form-login.password"
								name="password"
								class="form-control form-control-lg"
								autocomplete="current-password"
								required
								placeholder="Enter your password"
							/>
						</div>
						
						{#if form?.message}
							<div class="alert alert-danger" role="alert">
								<i class="bi bi-exclamation-triangle-fill me-2"></i>
								{form.message}
							</div>
						{/if}
						
						<div class="d-grid mb-3">
							<button type="submit" class="btn btn-primary btn-lg">
								<i class="bi bi-box-arrow-in-right me-2"></i>Sign in
							</button>
						</div>
					</form>
					
					<div class="text-center">
						<p class="text-muted mb-0">Don't have an account?</p>
						<a href="/signup" class="btn btn-outline-secondary mt-2">
							<i class="bi bi-person-plus-fill me-2"></i>Create an account
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
