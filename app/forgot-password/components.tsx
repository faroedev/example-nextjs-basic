"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "./actions";

const initialState = {
	message: "",
	email: ""
};

export function ForgotPasswordForm() {
	const [state, action] = useActionState(forgotPasswordAction, initialState);
	return (
		<form action={action}>
			<label htmlFor="form-forgot.email">Email</label>
			<input type="email" id="form-forgot.email" name="email" required defaultValue={state.email} />
			<br />
			<button>Send</button>
			<p>{state.message}</p>
		</form>
	);
}
