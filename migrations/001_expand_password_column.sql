-- Required before enabling Argon2 password hashes.
-- Back up the database and review the existing column attributes first.
ALTER TABLE user_data MODIFY COLUMN password VARCHAR(255) NOT NULL;

