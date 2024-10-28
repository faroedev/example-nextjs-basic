import { getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";

import Link from "next/link";
import { LogoutButton } from "./components";

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
			<h1>Hi, {user.username}!</h1>
			<p>Your email address is {user.email}.</p>
			<Link href="/settings">Settings</Link>
			<LogoutButton />
		</>
	);
}
