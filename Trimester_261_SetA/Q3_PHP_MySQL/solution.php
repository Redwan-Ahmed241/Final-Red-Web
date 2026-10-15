<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tourism";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Trimester 261 Set A - Question 3 Solutions</h1>";

// -------------------------------------------------------------
// Task 1: Display SpotName, Region and Rating of all spots whose rating > 4.5
// or whose SpotName contains 'Beach'. Sort by Rating DESC.
// -------------------------------------------------------------
echo "<h3>1. Spots with Rating > 4.5 or Name containing 'Beach' (Sorted by Rating DESC)</h3>";
$sql1 = "SELECT SpotName, Region, Rating 
         FROM tourist_spot 
         WHERE Rating > 4.5 OR SpotName LIKE '%Beach%' 
         ORDER BY Rating DESC";
$result1 = $conn->query($sql1);

if ($result1 && $result1->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Spot Name</th><th>Region</th><th>Rating</th></tr>";
    while ($row = $result1->fetch_assoc()) {
        echo "<tr><td>" . $row["SpotName"] . "</td><td>" . $row["Region"] . "</td><td>" . $row["Rating"] . "</td></tr>";
    }
    echo "</table>";
}

// -------------------------------------------------------------
// Task 2: For spots whose rating is between 4.0 and 4.5 (inclusive) and EntryFee > 0,
// increase Rating by 0.2 and raise EntryFee by 10%.
// -------------------------------------------------------------
echo "<h3>2. Updating Rating (+0.2) and EntryFee (+10%) for Rating 4.0-4.5 and EntryFee > 0</h3>";
$sql2 = "UPDATE tourist_spot 
         SET Rating = Rating + 0.2, EntryFee = EntryFee * 1.10 
         WHERE Rating >= 4.0 AND Rating <= 4.5 AND EntryFee > 0";

if ($conn->query($sql2) === TRUE) {
    echo "Spots updated successfully (Affected rows: " . $conn->affected_rows . ")<br>";
} else {
    echo "Error updating spots: " . $conn->error . "<br>";
}

// -------------------------------------------------------------
// Task 3: For each category, show category name, number of spots, average rating,
// and total visitors per year, but only include categories whose average rating is above 4.4.
// Sort by average rating descending.
// -------------------------------------------------------------
echo "<h3>3. Category Statistics (Avg Rating > 4.4, Sorted by Avg Rating DESC)</h3>";
$sql3 = "SELECT Category, COUNT(*) AS TotalSpots, AVG(Rating) AS AvgRating, SUM(VisitorsPerYear) AS TotalVisitors 
         FROM tourist_spot 
         GROUP BY Category 
         HAVING AVG(Rating) > 4.4 
         ORDER BY AvgRating DESC";
$result3 = $conn->query($sql3);

if ($result3 && $result3->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Category</th><th>Total Spots</th><th>Average Rating</th><th>Total Visitors / Year</th></tr>";
    while ($row = $result3->fetch_assoc()) {
        echo "<tr>
                <td>" . $row["Category"] . "</td>
                <td>" . $row["TotalSpots"] . "</td>
                <td>" . number_format($row["AvgRating"], 2) . "</td>
                <td>" . number_format($row["TotalVisitors"]) . "</td>
              </tr>";
    }
    echo "</table>";
}

// -------------------------------------------------------------
// Task 4: For each region, show region name and total estimated yearly revenue
// SUM(EntryFee * VisitorsPerYear). Display only regions whose revenue exceeds 1,000,000,
// ordered from highest to lowest.
// -------------------------------------------------------------
echo "<h3>4. Estimated Yearly Revenue per Region (> 1,000,000 BDT, Highest to Lowest)</h3>";
$sql4 = "SELECT Region, SUM(EntryFee * VisitorsPerYear) AS EstimatedRevenue 
         FROM tourist_spot 
         GROUP BY Region 
         HAVING EstimatedRevenue > 1000000 
         ORDER BY EstimatedRevenue DESC";
$result4 = $conn->query($sql4);

if ($result4 && $result4->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Region</th><th>Estimated Revenue (BDT)</th></tr>";
    while ($row = $result4->fetch_assoc()) {
        echo "<tr><td>" . $row["Region"] . "</td><td>" . number_format($row["EstimatedRevenue"]) . "</td></tr>";
    }
    echo "</table>";
} else {
    echo "No regions found with estimated revenue exceeding 1,000,000 BDT.<br>";
}

$conn->close();
?>
