"use server";

import { getCurrentSession } from "@/lib/server/session";
import { setUserAsEmailVerified } from "@/lib/server/user";
import { redirect } from "next/navigation";
import { FaroeError } from "@faroe/sdk";
import { faroe } from "@/lib/server/faroe";

import type { FaroeUserEmailVerificationRequest } from "@faroe/sdk";

export async function verifyEmailAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const { session, user } = await getCurrentSession();
	if (session === null) {
		return redirect("/login");
	}
	if (user.emailVerified) {
		return redirect("/");
	}

	const code = formData.get("code");
	if (typeof code !== "string") {
		return {
			message: "Invalid or missing fields."
		};
	}
	if (code.length !== 8) {
		return {
			message: "Please enter your verification code."
		};
	}

	try {
		await faroe.verifyUserEmail(user.faroeId, code);
	} catch (e) {
		if (e instanceof FaroeError && e.code === "NOT_ALLOWED") {
			const verificationRequest = await faroe.createUserEmailVerificationRequest(user.faroeId);
			console.log(`To ${user.email}: Your code is ${verificationRequest.code}`);
			return {
				message: "Your verification code was expired. We sent a new one to your inbox."
			};
		}
		if (e instanceof FaroeError && e.code === "INCORRECT_CODE") {
			return {
				message: "Incorrect code."
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
	setUserAsEmailVerified(user.id);
	return redirect("/");
}

export async function resendVerificationCodeAction(): Promise<ActionResult> {
	const { session, user } = await getCurrentSession();
	if (session === null || user === null) {
		return redirect("/login");
	}
	if (user.emailVerified) {
		return redirect("/");
	}

	let verificationRequest: FaroeUserEmailVerificationRequest;
	try {
		verificationRequest = await faroe.createUserEmailVerificationRequest(user.faroeId);
	} catch (e) {
		if (e instanceof FaroeError && e.code === "TOO_MANY_REQUESTS") {
			return {
				message: "Please try again later."
			};
		}
		return {
			message: "An unknown error occurred. Please try again later."
		};
	}

	console.log(`To ${user.email}: Your code is ${verificationRequest.code}`);
	return {
		message: "A new verification code was sent to your inbox."
	};
}

interface ActionResult {
	message: string;
}
