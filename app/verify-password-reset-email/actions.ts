"use server";

import { redirect } from "next/navigation";
import { FaroeError } from "@/lib/server/sdk";
import { faroe } from "@/lib/server/faroe";
import {
	deletePasswordResetSessionTokenCookie,
	getCurrentPasswordResetSession,
	invalidatePasswordResetSession,
	setPasswordResetSessionAsEmailVerified
} from "@/lib/server/password-reset-session";

export async function verifyPasswordResetEmailAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const { session } = await getCurrentPasswordResetSession();
	if (session === null) {
		return redirect("/forgot-password");
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
		await faroe.verifyPasswordResetRequestEmail(session.faroeRequestId, code, "0.0.0.0");
	} catch (e) {
		if (e instanceof FaroeError && e.code === "NOT_FOUND") {
			invalidatePasswordResetSession(session.id);
			await deletePasswordResetSessionTokenCookie();
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

	setPasswordResetSessionAsEmailVerified(session.id);

	return redirect("/reset-password");
}

interface ActionResult {
	message: string;
}
