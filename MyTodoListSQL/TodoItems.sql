CREATE TABLE todo_items (
	id serial PRIMARY KEY,
	is_completed boolean,
	description VARCHAR(256),
	is_active boolean DEFAULT TRUE
);

 ALTER TABLE todo_items ADD COLUMN sort_rank INT;
 ALTER TABLE todo_items ADD COLUMN user_id INT;
 