import { db } from "./db";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";
import { cache } from "react";

import type { User } from "./user";

export function validateSessionToken(token: string): SessionValidationResult {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = db.queryOne(
		`
SELECT session.id, session.user_id, session.expires_at, session.faroe_email_update_request_id, user.id, user.faroe_id, user.email, user.username, user.email_verified FROM session
INNER JOIN user ON session.user_id = user.id
WHERE session.id = ?
`,
		[sessionId]
	);

	if (row === null) {
		return { session: null, user: null };
	}
	const session: Session = {
		id: row.string(0),
		userId: row.number(1),
		expiresAt: new Date(row.number(2) * 1000),
		faroeEmailUpdateRequestId: row.stringNullable(3)
	};
	const user: User = {
		id: row.number(4),
		faroeId: row.string(5),
		email: row.string(6),
		username: row.string(7),
		emailVerified: Boolean(row.number(8))
	};
	if (Date.now() >= session.expiresAt.getTime()) {
		db.execute("DELETE FROM session WHERE id = ?", [session.id]);
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		db.execute("UPDATE session SET expires_at = ? WHERE session.id = ?", [
			Math.floor(session.expiresAt.getTime() / 1000),
			session.id
		]);
	}
	return { session, user };
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
	const cookieStore = await cookies();
	const token = cookieStore.get("session")?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = validateSessionToken(token);
	return result;
});

export function invalidateSession(sessionId: string): void {
	db.execute("DELETE FROM session WHERE id = ?", [sessionId]);
}

export function invalidateUserSessions(userId: number): void {
	db.execute("DELETE FROM session WHERE user_id = ?", [userId]);
}

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
	return token;
}

export function createSession(token: string, userId: number, faroeEmailUpdateRequestId: string | null): Session {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		faroeEmailUpdateRequestId
	};
	db.execute("INSERT INTO session (id, user_id, expires_at, faroe_email_update_request_id) VALUES (?, ?, ?, ?)", [
		session.id,
		session.userId,
		Math.floor(session.expiresAt.getTime() / 1000),
		session.faroeEmailUpdateRequestId
	]);
	return session;
}

export function setSessionFaroeEmailUpdateRequestId(sessionId: string, faroeEmailUpdateRequestId: string): void {
	db.execute("UPDATE session SET faroe_email_update_request_id = ? WHERE id = ?", [
		faroeEmailUpdateRequestId,
		sessionId
	]);
}

export function deleteSessionFaroeEmailUpdateRequestId(sessionId: string): void {
	db.execute("UPDATE session SET faroe_email_update_request_id = null WHERE id = ?", [sessionId]);
}

export interface Session {
	id: string;
	expiresAt: Date;
	userId: number;
	faroeEmailUpdateRequestId: string | null;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
