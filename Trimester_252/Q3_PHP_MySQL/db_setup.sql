-- Database and table setup for Trimester 252 Question 3
CREATE DATABASE IF NOT EXISTS sundarban;
USE sundarban;

CREATE TABLE IF NOT EXISTS sales_data (
    SaleID INT PRIMARY KEY,
    ProductName VARCHAR(100),
    CategoryID INT,
    CategoryName VARCHAR(100),
    Quantity INT,
    Revenue DOUBLE
);

-- Insert sample records
INSERT INTO sales_data (SaleID, ProductName, CategoryID, CategoryName, Quantity, Revenue) VALUES
(1, 'Laptop', 301, 'Electronics', 5, 350000),
(2, 'Mouse', 301, 'Electronics', 15, 45000),
(3, 'Chair', 302, 'Furniture', 8, 64000),
(4, 'Desk', 302, 'Furniture', 6, 72000),
(5, 'Bottle', 303, 'Accessories', 20, 30000),
(6, 'Pen', 303, 'Accessories', 25, 20000);
