<h1>Create an account</h1>
<p>
	Your username must be at least 3 characters long and your password must be at least 8 characters
	long.
</p>
<form method="POST">
	<label for="form-signup.username">Username</label>
	<input id="form-signup.username" name="username" required minlength="4" maxlength="31" /><br />
	<label for="form-signup.email">Email</label>
	<input type="email" id="form-signup.email" name="email" autocomplete="username" required /><br />
	<label for="form-signup.password">Password</label>
	<input
		type="password"
		id="form-signup.password"
		name="password"
		autocomplete="new-password"
		required
	/><br/>
	<button>Continue</button>
</form>
<a href="/login">Sign in</a>
