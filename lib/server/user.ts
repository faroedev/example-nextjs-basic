import { db } from "./db";

export function verifyUsernameInput(username: string): boolean {
	return username.length > 3 && username.length < 32 && username.trim() === username;
}

export function createUser(faroeId: string, email: string, username: string): User {
	const row = db.queryOne("INSERT INTO user (faroe_id, email, username) VALUES (?, ?, ?) RETURNING user.id", [
		faroeId,
		email,
		username
	]);
	if (row === null) {
		throw new Error("Unexpected error");
	}
	const user: User = {
		id: row.number(0),
		faroeId,
		username,
		email,
		emailVerified: false
	};
	return user;
}

export function updateUserEmailAndSetEmailAsVerified(userId: number, email: string): void {
	db.execute("UPDATE user SET email = ?, email_verified = 1 WHERE id = ?", [email, userId]);
}

export function getUserFromFaroeId(faroeId: string): User | null {
	const row = db.queryOne("SELECT id, faroe_id, email, username, email_verified FROM user WHERE faroe_id = ?", [
		faroeId
	]);
	if (row === null) {
		return null;
	}
	const user: User = {
		id: row.number(0),
		faroeId: row.string(1),
		email: row.string(2),
		username: row.string(3),
		emailVerified: Boolean(row.number(4))
	};
	return user;
}

export function setUserAsEmailVerified(userId: number): void {
	db.execute("UPDATE user SET email_verified = 1 WHERE id = ?", [userId]);
}

export interface User {
	id: number;
	faroeId: string;
	email: string;
	username: string;
	emailVerified: boolean;
}
