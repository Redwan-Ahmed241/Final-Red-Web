-- Database and table setup for Trimester 261 Set B Question 3
CREATE DATABASE IF NOT EXISTS uiu_bookshop;
USE uiu_bookshop;

CREATE TABLE IF NOT EXISTS book_info (
    BookID INT PRIMARY KEY,
    BookTitle VARCHAR(100),
    Author VARCHAR(100),
    Category VARCHAR(50),
    Price DOUBLE,
    Stock INT
);

-- Insert sample records
INSERT INTO book_info (BookID, BookTitle, Author, Category, Price, Stock) VALUES
(1, 'Web Basics', 'John Smith', 'Programming', 450, 10),
(2, 'Database Guide', 'Alice Roy', 'Programming', 550, 8),
(3, 'English Grammar', 'Mary Khan', 'Language', 300, 15),
(4, 'Business Math', 'David Lee', 'Business', 400, 12),
(5, 'Python Mastery', 'Sara Ahmed', 'Programming', 600, 5),
(6, 'French Made Easy', 'Paul Costa', 'Language', 350, 7);
