-- Database and table setup for Trimester 261 Set A Question 3
CREATE DATABASE IF NOT EXISTS tourism;
USE tourism;

CREATE TABLE IF NOT EXISTS tourist_spot (
    SpotID INT PRIMARY KEY,
    SpotName VARCHAR(100),
    Region VARCHAR(20),
    Category VARCHAR(50),
    Rating DECIMAL(3, 1),
    EntryFee INT,
    VisitorsPerYear INT
);

-- Insert initial sample records
INSERT INTO tourist_spot (SpotID, SpotName, Region, Category, Rating, EntryFee, VisitorsPerYear) VALUES
(1, 'Cox’s Bazar Beach', 'CTG', 'Beach', 4.9, 0, 150000),
(2, 'Sundarbans Forest', 'KHL', 'Nature', 4.3, 150, 80000),
(3, 'Ratargul Forest', 'SYL', 'Nature', 4.8, 100, 60000),
(4, 'Kuakata Beach', 'PTU', 'Beach', 4.5, 0, 90000),
(5, 'Shat Gambuj Mosque', 'BGH', 'Heritage', 4.7, 30, 70000),
(6, 'Paharpur', 'NWG', 'Heritage', 4.1, 30, 40000);
