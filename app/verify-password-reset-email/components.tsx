"use client";

import { verifyPasswordResetEmailAction } from "./actions";
import { useActionState } from "react";

const initialState = {
	message: ""
};

export function VerifyEmailForm() {
	const [state, action] = useActionState(verifyPasswordResetEmailAction, initialState);
	return (
		<form action={action}>
			<label htmlFor="form-verify.code">Code</label>
			<input id="form-verify.code" name="code" required />
			<button>Verify</button>
			<p>{state.message}</p>
		</form>
	);
}
