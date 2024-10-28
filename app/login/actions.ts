"use server";

import { createSession, generateSessionToken, setSessionTokenCookie } from "@/lib/server/session";
import { getUserFromEmail } from "@/lib/server/user";
import { redirect } from "next/navigation";
import { FaroeError, verifyPasswordInput, verifyEmailInput } from "@faroe/sdk";
import { faroe } from "@/lib/server/faroe";

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	let email = formData.get("email");
	const password = formData.get("password");
	if (typeof email !== "string" || typeof password !== "string") {
		return {
			message: "Invalid or missing fields."
		};
	}
	email = email.toLowerCase();

	if (email === "" || password === "") {
		return {
			message: "Please enter your email and password."
		};
	}
	if (!verifyEmailInput(email)) {
		return {
			email,
			message: "Please enter a valid email address."
		};
	}
	if (!verifyPasswordInput(password)) {
		return {
			email,
			message: "Please enter a valid password."
		};
	}

	const user = getUserFromEmail(email);
	if (user === null) {
		return {
			email,
			message: "Account does not exist."
		};
	}

	try {
		await faroe.verifyUserPassword(user.faroeId, password, "0.0.0.0");
	} catch (e) {
		if (e instanceof FaroeError && e.code === "INCORRECT_PASSWORD") {
			return {
				email,
				message: "Incorrect password."
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

	const sessionToken = generateSessionToken();
	const session = createSession(sessionToken, user.id, null);

	await setSessionTokenCookie(sessionToken, session.expiresAt);
	return redirect("/");
}

interface ActionResult {
	email?: string;
	message: string;
}
