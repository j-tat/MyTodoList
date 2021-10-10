CREATE USER dev with password 'dev';

CREATE TABLE todo_items (
	id serial PRIMARY KEY,
	is_completed boolean,
	description VARCHAR(256),
	is_active boolean DEFAULT TRUE
);

 ALTER TABLE todo_items ADD COLUMN sort_rank INT;
 ALTER TABLE todo_items ADD COLUMN user_id INT;
 
 CREATE TABLE users (
	id serial PRIMARY KEY,
	username VARCHAR(50),
  password_hash bytea,
  password_salt bytea
);

GRANT ALL PRIVILEGES ON DATABASE mytodolist TO dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dev;
