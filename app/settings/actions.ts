"use server";

import {
	createSession,
	generateSessionToken,
	getCurrentSession,
	invalidateUserSessions,
	setSessionFaroeEmailUpdateRequestId,
	setSessionTokenCookie
} from "@/lib/server/session";
import { redirect } from "next/navigation";
import { FaroeError, verifyEmailInput, verifyPasswordInput } from "@faroe/sdk";
import { faroe } from "@/lib/server/faroe";
import { getUserFromEmail } from "@/lib/server/user";

import type { FaroeEmailUpdateRequest } from "@faroe/sdk";

export async function updatePasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const { session, user } = await getCurrentSession();
	if (session === null) {
		return redirect("/login");
	}

	const password = formData.get("password");
	const newPassword = formData.get("new_password");
	if (typeof password !== "string" || typeof newPassword !== "string") {
		return {
			message: "Invalid or missing fields."
		};
	}
	if (password === "" || newPassword === "") {
		return {
			message: "Please enter your current password and new password."
		};
	}
	if (!verifyPasswordInput(password)) {
		return {
			message: "Please enter a valid password."
		};
	}
	if (!verifyPasswordInput(newPassword)) {
		return {
			message: "Please enter a valid password."
		};
	}

	try {
		await faroe.updateUserPassword(user.faroeId, password, newPassword, "0.0.0.0");
	} catch (e) {
		if (e instanceof FaroeError && e.code === "INCORRECT_PASSWORD") {
			return {
				message: "Incorrect password."
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
			message: "An unknown error occurred. Please try again later."
		};
	}

	invalidateUserSessions(user.id);

	const newSessionToken = generateSessionToken();
	const newSession = createSession(newSessionToken, user.id, null);

	await setSessionTokenCookie(newSessionToken, newSession.expiresAt);
	return {
		message: "Password updated."
	};
}

export async function sendEmailUpdateCode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const { session, user } = await getCurrentSession();
	if (session === null) {
		return redirect("/login");
	}

	let email = formData.get("email");
	if (typeof email !== "string") {
		return {
			message: "Invalid or missing fields."
		};
	}
	email = email.toLowerCase();
	
	if (email === "") {
		return {
			message: "Please enter your email address."
		};
	}
	if (!verifyEmailInput(email)) {
		return {
			message: "Please enter a valid email address."
		};
	}

	const existingUser = getUserFromEmail(email);
	if (existingUser !== null) {
		return {
			message: "This email address is already used."
		};
	}

	let updateRequest: FaroeEmailUpdateRequest;
	try {
		updateRequest = await faroe.createUserEmailUpdateRequest(user.faroeId, email);
	} catch (e) {
		if (e instanceof FaroeError && e.code === "TOO_MANY_REQUESTS") {
			return { message: "Please try again later." };
		}
		return { message: "An unknown error occurred. Please try again later." };
	}

	console.log(`To ${email}: Your code is ${updateRequest.code}`);

	setSessionFaroeEmailUpdateRequestId(session.id, updateRequest.id);

	return redirect("/update-email");
}

interface ActionResult {
	message: string;
}
