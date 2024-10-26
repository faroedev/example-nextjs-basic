import { getCurrentPasswordResetSession } from "@/lib/server/password-reset-session";
import { ResetPasswordForm } from "./components";
import { redirect } from "next/navigation";

export default async function Page() {
	const { session } = await getCurrentPasswordResetSession();
	if (session === null) {
		return redirect("/forgot-password");
	}
	if (!session.emailVerified) {
		return redirect("/verify-password-reset-email");
	}
	return (
		<>
			<h1>Reset your password</h1>
			<ResetPasswordForm />
		</>
	);
}
