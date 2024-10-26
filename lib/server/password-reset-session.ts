import { db } from "./db";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";
import { cache } from "react";

import type { User } from "./user";

export function validatePasswordResetSessionToken(token: string): PasswordResetSessionValidationResult {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = db.queryOne(
		`SELECT password_reset_session.id, password_reset_session.faroe_request_id, password_reset_session.user_id, password_reset_session.expires_at, password_reset_session.email_verified,
user.id, user.faroe_id, user.email, user.username, user.email_verified FROM password_reset_session
INNER JOIN user ON password_reset_session.user_id = user.id
WHERE password_reset_session.id = ?`,
		[sessionId]
	);

	if (row === null) {
		return { session: null, user: null };
	}
	const session: PasswordResetSession = {
		id: row.string(0),
		faroeRequestId: row.string(1),
		userId: row.number(2),
		expiresAt: new Date(row.number(3) * 1000),
		emailVerified: Boolean(row.number(4))
	};
	const user: User = {
		id: row.number(5),
		faroeId: row.string(6),
		email: row.string(7),
		username: row.string(8),
		emailVerified: Boolean(row.number(9))
	};
	if (Date.now() >= session.expiresAt.getTime()) {
		db.execute("DELETE FROM session WHERE id = ?", [session.id]);
		return { session: null, user: null };
	}
	return { session, user };
}

export function invalidatePasswordResetSession(sessionId: string): void {
	db.execute("DELETE FROM password_reset_session WHERE id = ?", [sessionId]);
}

export function invalidatePasswordResetUserSessions(userId: number): void {
	db.execute("DELETE FROM password_reset_session WHERE user_id = ?", [userId]);
}

export async function setPasswordResetSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("password_reset_session", token, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	});
}

export async function deletePasswordResetSessionTokenCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("password_reset_session", "", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	});
}

export function createPasswordResetSession(
	token: string,
	userId: number,
	faroeRequestId: string
): PasswordResetSession {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: PasswordResetSession = {
		id: sessionId,
		faroeRequestId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 10),
		emailVerified: false
	};
	db.execute("INSERT INTO password_reset_session (id, faroe_request_id, user_id, expires_at) VALUES (?, ?, ?, ?)", [
		session.id,
		session.faroeRequestId,
		session.userId,
		Math.floor(session.expiresAt.getTime() / 1000)
	]);
	return session;
}

export const getCurrentPasswordResetSession = cache(async (): Promise<PasswordResetSessionValidationResult> => {
	const cookieStore = await cookies();
	const token = cookieStore.get("password_reset_session")?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = validatePasswordResetSessionToken(token);
	return result;
});

export function setPasswordResetSessionAsEmailVerified(sessionId: string): void {
	db.execute("UPDATE password_reset_session SET email_verified = 1 WHERE id = ?", [sessionId]);
}

export interface PasswordResetSession {
	id: string;
	faroeRequestId: string;
	userId: number;
	expiresAt: Date;
	emailVerified: boolean;
}

type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: User }
	| { session: null; user: null };
