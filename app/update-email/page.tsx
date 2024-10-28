import { faroe } from "@/lib/server/faroe";
import { deleteSessionFaroeEmailUpdateRequestId, getCurrentSession } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { UpdateEmailForm } from "./components";

export default async function Page() {
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
	const updateRequest = await faroe.getEmailUpdateRequest(session.faroeEmailUpdateRequestId);
	if (updateRequest === null) {
		deleteSessionFaroeEmailUpdateRequestId(session.id);
		return redirect("/");
	}
	return (
		<>
			<h1>Verify your new email address</h1>
			<p>A verification code was sent to {updateRequest.email}</p>
			<UpdateEmailForm />
		</>
	);
}
