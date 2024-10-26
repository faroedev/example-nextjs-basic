"use client";

import { signupAction } from "./actions";
import { useActionState } from "react";

const initialState = {
	username: "",
	email: "",
	message: ""
};

export function SignUpForm() {
	const [state, action] = useActionState(signupAction, initialState);

	return (
		<form action={action}>
			<label htmlFor="form-signup.username">Username</label>
			<input
				id="form-signup.username"
				name="username"
				required
				minLength={3}
				maxLength={31}
				defaultValue={state.username}
			/>
			<br />
			<label htmlFor="form-signup.email">Email</label>
			<input
				type="email"
				id="form-signup.email"
				name="email"
				autoComplete="username"
				required
				defaultValue={state.email}
			/>
			<br />
			<label htmlFor="form-signup.password">Password</label>
			<input type="password" id="form-signup.password" name="password" autoComplete="new-password" required />
			<br />
			<button>Continue</button>
			<p>{state.message}</p>
		</form>
	);
}
