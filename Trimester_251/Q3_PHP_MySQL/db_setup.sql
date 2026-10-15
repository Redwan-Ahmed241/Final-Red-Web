-- Create database and table for 251 Question 3
CREATE DATABASE IF NOT EXISTS uiutech_final;
USE uiutech_final;

CREATE TABLE IF NOT EXISTS employee_final (
    EmployeeID INT PRIMARY KEY,
    EmployeeName VARCHAR(100),
    DepartmentID INT,
    DepartmentName VARCHAR(100),
    Salary INT,
    PerformanceRating VARCHAR(5)
);

-- Insert initial sample records
INSERT INTO employee_final (EmployeeID, EmployeeName, DepartmentID, DepartmentName, Salary, PerformanceRating) VALUES
(1, 'Arif Rahman', 201, 'Software Development', 45000, 'B'),
(2, 'Marium Khan', 201, 'Software Development', 52000, 'A'),
(3, 'Sabbir Hossain', 202, 'Quality Assurance', 38000, 'C'),
(4, 'Samira Begum', 203, 'UI/UX Design', 42000, 'B');
