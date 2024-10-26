"use client";

import { sendEmailUpdateCode, updatePasswordAction } from "./actions";
import { useActionState } from "react";

const initialUpdatePasswordState = {
	message: ""
};

export function UpdatePasswordForm() {
	const [state, action] = useActionState(updatePasswordAction, initialUpdatePasswordState);

	return (
		<form action={action}>
			<label htmlFor="form-password.password">Current password</label>
			<input type="password" id="form-email.password" name="password" autoComplete="current-password" required />
			<br />
			<label htmlFor="form-password.new-password">New password</label>
			<input type="password" id="form-password.new-password" name="new_password" autoComplete="new-password" required />
			<br />
			<button>Update</button>
			<p>{state.message}</p>
		</form>
	);
}

const initialSendEmailUpdateCodeFormState = {
	message: ""
};

export function SendEmailUpdateCodeForm() {
	const [state, action] = useActionState(sendEmailUpdateCode, initialSendEmailUpdateCodeFormState);

	return (
		<form action={action}>
			<label htmlFor="form-email.email">New email</label>
			<input type="email" id="form-email.email" name="email" required />
			<br />
			<button>Update</button>
			<p>{state.message}</p>
		</form>
	);
}
