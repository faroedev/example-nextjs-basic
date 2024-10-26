import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { ResendVerificationCodeForm, VerifyEmailForm } from "./components";
import { faroe } from "@/lib/server/faroe";
import { FaroeError } from "@faroe/sdk";

export default async function Page() {
	const { user } = await getCurrentSession();
	if (user === null) {
		return redirect("/login");
	}
	if (user.emailVerified) {
		return redirect("/");
	}
	let verificationRequest = await faroe.getUserEmailVerificationRequest(user.faroeId);
	if (verificationRequest === null) {
		try {
			verificationRequest = await faroe.createUserEmailVerificationRequest(user.faroeId);
			console.log(`To ${user.email}: Your code is ${verificationRequest.code}`);
		} catch (e) {
			if (e instanceof FaroeError && e.code === "TOO_MANY_REQUESTS") {
				return (
					<>
						<h1>Verify your email address</h1>
						<p>Please try again later.</p>
					</>
				);
			}
			throw e;
		}
	}
	return (
		<>
			<h1>Verify your email address</h1>
			<p>A verification code was sent to {user.email}</p>
			<VerifyEmailForm />
			<ResendVerificationCodeForm />
		</>
	);
}
