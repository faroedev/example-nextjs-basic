import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";

import { LoginForm } from "./components";
import Link from "next/link";

export default async function Page() {
	const { user } = await getCurrentSession();
	if (user !== null) {
		if (!user.emailVerified) {
			return redirect("/verify-email");
		}
		return redirect("/login");
	}
	return (
		<>
			<h1>Sign in</h1>
			<LoginForm />
			<Link href="/signup">Create an account</Link>
			<Link href="/forgot-password">Forgot password?</Link>
		</>
	);
}
