"use server";

import { createSession, generateSessionToken, setSessionTokenCookie } from "@/lib/server/session";
import { createUser } from "@/lib/server/user";
import { redirect } from "next/navigation";
import { FaroeError, verifyPasswordInput, verifyEmailInput } from "@faroe/sdk";
import { faroe } from "@/lib/server/faroe";

import type { FaroeUser } from "@faroe/sdk";
import type { User } from "@/lib/server/user";

export async function signupAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const username = formData.get("username");
	const email = formData.get("email");
	const password = formData.get("password");
	if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
		return {
			message: "Invalid or missing fields."
		};
	}
	if (username === "" || email === "" || password === "") {
		return {
			username,
			email,
			message: "Please enter your username, email, and password."
		};
	}

	if (username.length < 3 || username.length >= 32 || !/[A-Za-z0-9]/.test(username)) {
		return {
			username,
			email,
			message: "Please enter a valid username."
		};
	}
	if (!verifyEmailInput(email)) {
		return {
			username,
			email,
			message: "Please enter a valid email address."
		};
	}
	if (!verifyPasswordInput(password)) {
		return {
			username,
			email,
			message: "Please enter a valid password."
		};
	}

	let faroeUser: FaroeUser;
	try {
		faroeUser = await faroe.createUser(email, password, "0.0.0.0");
	} catch (e) {
		if (e instanceof FaroeError && e.code === "EMAIL_ALREADY_USED") {
			return {
				username,
				email,
				message: "Email is already used."
			};
		}
		if (e instanceof FaroeError && e.code === "WEAK_PASSWORD") {
			return {
				username,
				email,
				message: "Please use a stronger password."
			};
		}
		if (e instanceof FaroeError && e.code === "TOO_MANY_REQUESTS") {
			return {
				username,
				email,
				message: "Please try again later."
			};
		}
		return {
			username,
			email,
			message: "An unknown error occurred. Please try again later."
		};
	}

	let user: User;
	try {
		user = createUser(faroeUser.id, email, username);
	} catch (e) {
		console.log(e);
		await faroe.deleteUser(faroeUser.id);
		return {
			username,
			email,
			message: "An unknown error occurred. Please try again later."
		};
	}

	const verificationRequest = await faroe.createUserEmailVerificationRequest(user.faroeId);
	console.log(`To ${user.email}: Your code is ${verificationRequest.code}`);

	const sessionToken = generateSessionToken();
	const session = createSession(sessionToken, user.id, null);

	setSessionTokenCookie(sessionToken, session.expiresAt);
	return redirect("/verify-email");
}

interface ActionResult {
	username?: string;
	email?: string;
	message: string;
}
