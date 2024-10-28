import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";

import { SendEmailUpdateCodeForm, UpdatePasswordForm } from "./components";

export default async function Page() {
	const { user } = await getCurrentSession();
	if (user === null) {
		return redirect("/login");
	}
	if (!user.emailVerified) {
		return redirect("/verify-email");
	}
	return (
		<>
			<h1>Settings</h1>
			<section>
				<h2>Update email address</h2>
				<SendEmailUpdateCodeForm />
			</section>
			<section>
				<h2>Update password</h2>
				<UpdatePasswordForm />
			</section>
		</>
	);
}
