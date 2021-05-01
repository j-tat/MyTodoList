CREATE TABLE users (
	id serial PRIMARY KEY,
	username VARCHAR(50),
  password_hash bytea,
  password_salt bytea
);
