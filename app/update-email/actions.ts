"use server";

import { deleteSessionFaroeEmailUpdateRequestId, getCurrentSession } from "@/lib/server/session";
import { updateUserEmailAndSetEmailAsVerified } from "@/lib/server/user";
import { redirect } from "next/navigation";
import { FaroeError } from "@faroe/sdk";
import { faroe } from "@/lib/server/faroe";

export async function updateEmailAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const { session, user } = await getCurrentSession();
	if (session === null) {
		return redirect("/login");
	}
	if (!user.emailVerified) {
		return redirect("/verify-email");
	}
	if (session.faroeEmailUpdateRequestId === null) {
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

	let updatedEmail: string;
	try {
		updatedEmail = await faroe.verifyNewUserEmail(session.faroeEmailUpdateRequestId, code);
	} catch (e) {
		if (e instanceof FaroeError && e.code === "INVALID_REQUEST_ID") {
			return {
				message: "Please restart the process."
			};
		}
		if (e instanceof FaroeError && e.code === "INCORRECT_CODE") {
			return {
				message: "Incorrect code."
			};
		}
		if (e instanceof FaroeError && e.code === "TOO_MANY_REQUESTS") {
			return {
				message: "Please restart the process."
			};
		}
		return {
			message: "An unknown error occurred. Please try again later."
		};
	}

	updateUserEmailAndSetEmailAsVerified(user.id, updatedEmail);
	deleteSessionFaroeEmailUpdateRequestId(session.id);

	return redirect("/");
}

interface ActionResult {
	message: string;
}
