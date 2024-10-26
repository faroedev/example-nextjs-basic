import { getCurrentPasswordResetSession } from "@/lib/server/password-reset-session";
import { VerifyEmailForm } from "./components";
import { redirect } from "next/navigation";

export default async function Page() {
	const { session, user } = await getCurrentPasswordResetSession();
	if (session === null) {
		return redirect("/forgot-password");
	}
	if (session.emailVerified) {
		return redirect("/reset-password");
	}
	return (
		<>
			<h1>Verify your email address</h1>
			<p>A verification code was sent to {user.email}</p>
			<VerifyEmailForm />
		</>
	);
}
