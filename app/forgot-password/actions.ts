"use server";

import { generateSessionToken } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { FaroeError, verifyEmailInput } from "@faroe/sdk";
import { faroe } from "@/lib/server/faroe";
import { getUserFromFaroeId } from "@/lib/server/user";
import { createPasswordResetSession, setPasswordResetSessionTokenCookie } from "@/lib/server/password-reset-session";

import type { FaroePasswordResetRequest } from "@faroe/sdk";

export async function forgotPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const email = formData.get("email");
	if (typeof email !== "string") {
		return {
			message: "Invalid or missing fields."
		};
	}
	if (email === "") {
		return {
			message: "Please enter your email address."
		};
	}
	if (!verifyEmailInput(email)) {
		return {
			email,
			message: "Please enter a valid email address."
		};
	}

	let resetRequest: FaroePasswordResetRequest;
	let verificationCode: string;
	try {
		[resetRequest, verificationCode] = await faroe.createPasswordResetRequest(email, "0.0.0.0");
	} catch (e) {
		if (e instanceof FaroeError && e.code === "USER_NOT_EXISTS") {
			return {
				email,
				message: "Account does not exist."
			};
		}
		if (e instanceof FaroeError && e.code === "TOO_MANY_REQUESTS") {
			return {
				email,
				message: "Please try again later."
			};
		}
		return {
			email,
			message: "An unknown error occurred. Please try again later."
		};
	}

	const user = getUserFromFaroeId(resetRequest.userId);
	if (user === null) {
		await faroe.deleteUser(resetRequest.userId);
		return {
			email,
			message: "Account does not exist."
		};
	}

	console.log(`To ${email}: Your code is ${verificationCode}`);

	const sessionToken = generateSessionToken();
	const session = createPasswordResetSession(sessionToken, user.id, resetRequest.id);

	await setPasswordResetSessionTokenCookie(sessionToken, session.expiresAt);

	return redirect("/verify-password-reset-email");
}

interface ActionResult {
	email?: string;
	message: string;
}
