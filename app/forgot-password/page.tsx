import Link from "next/link";
import { ForgotPasswordForm } from "./components";

export default async function Page() {
	return (
		<>
			<h1>Forgot password?</h1>
			<ForgotPasswordForm />
			<Link href="/login">Sign in</Link>
		</>
	);
}
