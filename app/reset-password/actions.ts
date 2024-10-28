"use server";

import { createSession, generateSessionToken, setSessionTokenCookie } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { FaroeError, verifyPasswordInput } from "@faroe/sdk";
import { faroe } from "@/lib/server/faroe";
import {
	deletePasswordResetSessionTokenCookie,
	getCurrentPasswordResetSession,
	invalidatePasswordResetSession
} from "@/lib/server/password-reset-session";
import { setUserAsEmailVerified } from "@/lib/server/user";

export async function resetPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const { session: passwordResetSession, user } = await getCurrentPasswordResetSession();
	if (passwordResetSession === null) {
		return redirect("/login");
	}
	if (!passwordResetSession.emailVerified) {
		return redirect("/verify-password-reset-email");
	}

	const password = formData.get("password");
	if (typeof password !== "string") {
		return {
			message: "Invalid or missing fields."
		};
	}
	if (password === "") {
		return {
			message: "Please enter your new password."
		};
	}
	if (!verifyPasswordInput(password)) {
		return {
			message: "Please enter a valid password."
		};
	}

	try {
		await faroe.resetUserPassword(passwordResetSession.faroeRequestId, password, "0.0.0.0");
	} catch (e) {
		if (e instanceof FaroeError && e.code === "INVALID_REQUEST_ID") {
			return {
				message: "Please restart the process."
			};
		}
		if (e instanceof FaroeError && e.code === "WEAK_PASSWORD") {
			return {
				message: "Please use a stronger password."
			};
		}
		if (e instanceof FaroeError && e.code === "TOO_MANY_REQUESTS") {
			return {
				message: "Please try again later."
			};
		}
		return {
			message: "An unknown error occurred. Please try again."
		};
	}

	setUserAsEmailVerified(user.id);
	invalidatePasswordResetSession(passwordResetSession.id);
	await deletePasswordResetSessionTokenCookie();

	const sessionToken = generateSessionToken();
	const session = createSession(sessionToken, user.id, null);
	await setSessionTokenCookie(sessionToken, session.expiresAt);

	return redirect("/");
}

interface ActionResult {
	message: string;
}
