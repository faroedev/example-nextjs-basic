"use server";

import { createSession, generateSessionToken, setSessionTokenCookie } from "@/lib/server/session";
import { getUserFromFaroeId } from "@/lib/server/user";
import { redirect } from "next/navigation";
import { FaroeError, verifyPasswordInput, verifyEmailInput } from "@faroe/sdk";
import { faroe } from "@/lib/server/faroe";

import type { FaroeUser } from "@faroe/sdk";

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const email = formData.get("email");
	const password = formData.get("password");
	if (typeof email !== "string" || typeof password !== "string") {
		return {
			message: "Invalid or missing fields."
		};
	}
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

	let faroeUser: FaroeUser;
	try {
		faroeUser = await faroe.authenticateWithPassword(email, password, "0.0.0.0");
	} catch (e) {
		if (e instanceof FaroeError && e.code === "USER_NOT_EXISTS") {
			return {
				email,
				message: "Account does not exist."
			};
		}
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
		console.log(e);
		return {
			email,
			message: "An unknown error occurred. Please try again later."
		};
	}

	const user = getUserFromFaroeId(faroeUser.id);
	if (user === null) {
		await faroe.deleteUser(faroeUser.id);
		return {
			email,
			message: "Account does not exist."
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
