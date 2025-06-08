--Create books table
CREATE TABLE books (
                       id SERIAL PRIMARY KEY,
                       title VARCHAR(255) NOT NULL,
                       author VARCHAR(100) NOT NULL,
                       isbn VARCHAR(15) UNIQUE NOT NULL
);

ALTER TABLE books ADD COLUMN publication_year INTEGER NOT NULL;

--Create an index on the title column
CREATE INDEX idx_books_title ON books(title);

--Create a stored procedure to count books by publication year
CREATE OR REPLACE PROCEDURE count_books_by_year(
    IN p_year INTEGER,
    OUT p_count INTEGER
)

LANGUAGE plpgsql
AS $$
BEGIN
SELECT COUNT(*) INTO p_count
FROM books
WHERE publication_year = p_year;
END;
$$;