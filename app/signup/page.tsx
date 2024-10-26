import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";

import { SignUpForm } from "./components";
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
			<h1>Create an account</h1>
			<SignUpForm />
			<Link href="/login">Sign in</Link>
		</>
	);
}
