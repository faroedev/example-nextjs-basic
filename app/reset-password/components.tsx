"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "./actions";

const initialState = {
	message: ""
};

export function ResetPasswordForm() {
	const [state, action] = useActionState(resetPasswordAction, initialState);
	return (
		<form action={action}>
			<label htmlFor="form-reset.password">Password</label>
			<input type="password" id="form-reset.password" name="password" autoComplete="new-password" required />
			<br />
			<button>Reset password</button>
			<p>{state.message}</p>
		</form>
	);
}
