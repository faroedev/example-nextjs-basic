"use client";

import { resendVerificationCodeAction, verifyEmailAction } from "./actions";
import { useActionState } from "react";

const emailVerificationInitialState = {
	message: ""
};

export function VerifyEmailForm() {
	const [state, action] = useActionState(verifyEmailAction, emailVerificationInitialState);
	return (
		<form action={action}>
			<label htmlFor="form-verify.code">Code</label>
			<input id="form-verify.code" name="code" required />
			<button>Verify</button>
			<p>{state.message}</p>
		</form>
	);
}

const resendVerificationCodeInitialState = {
	message: ""
};

export function ResendVerificationCodeForm() {
	const [state, action] = useActionState(resendVerificationCodeAction, resendVerificationCodeInitialState);
	return (
		<form action={action}>
			<button>Resend code</button>
			<p>{state.message}</p>
		</form>
	);
}
