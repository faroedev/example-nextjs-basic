CREATE TABLE user (
    id INTEGER NOT NULL PRIMARY KEY,
    faroe_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE INDEX user_faroe_id_index ON user(faroe_id);

CREATE TABLE session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL,
    faroe_email_update_request_id TEXT
) STRICT;

CREATE TABLE password_reset_session (
    id TEXT NOT NULL PRIMARY KEY,
    faroe_request_id TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0
) STRICT;
