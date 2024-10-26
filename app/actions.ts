"use server";

import { deleteSessionTokenCookie, getCurrentSession, invalidateSession } from "@/lib/server/session";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
	const { session } = await getCurrentSession();
	if (session === null) {
		return redirect("/login");
	}
	invalidateSession(session.id);
	await deleteSessionTokenCookie();
	return redirect("/login");
}
