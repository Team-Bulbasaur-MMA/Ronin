DROP TABLE IF EXISTS user_table;

CREATE TABLE user_table (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255)
);
























DROP TABLE IF EXISTS anime_table;

CREATE TABLE anime_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  image_url VARCHAR(255)
);