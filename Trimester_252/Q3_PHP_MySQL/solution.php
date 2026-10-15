<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sundarban";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Trimester 252 - Question 3 Solutions</h1>";

// -------------------------------------------------------------
// Task 1: Display the total revenue per category from the database
// -------------------------------------------------------------
echo "<h3>1. Total Revenue per Category</h3>";
$sql1 = "SELECT CategoryName, SUM(Revenue) AS TotalRevenue 
         FROM sales_data 
         GROUP BY CategoryName";
$result1 = $conn->query($sql1);

if ($result1 && $result1->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Category Name</th><th>Total Revenue (BDT)</th></tr>";
    while ($row = $result1->fetch_assoc()) {
        echo "<tr><td>" . $row["CategoryName"] . "</td><td>" . number_format($row["TotalRevenue"], 2) . "</td></tr>";
    }
    echo "</table>";
}

// -------------------------------------------------------------
// Task 2: If a product’s revenue is below 40,000 BDT, update its category to “Low Performing”
// -------------------------------------------------------------
echo "<h3>2. Updating Category to 'Low Performing' for Revenue < 40,000 BDT</h3>";
$sql2 = "UPDATE sales_data 
         SET CategoryName = 'Low Performing' 
         WHERE Revenue < 40000";

if ($conn->query($sql2) === TRUE) {
    echo "Updated low performing products successfully (Affected rows: " . $conn->affected_rows . ")<br>";
} else {
    echo "Error updating category: " . $conn->error . "<br>";
}

// -------------------------------------------------------------
// Task 3: For all products generating more than 70,000 BDT, add a 10% bonus revenue to their total
// -------------------------------------------------------------
echo "<h3>3. Adding 10% Bonus Revenue for Products > 70,000 BDT</h3>";
$sql3 = "UPDATE sales_data 
         SET Revenue = Revenue * 1.10 
         WHERE Revenue > 70000";

if ($conn->query($sql3) === TRUE) {
    echo "Bonus revenue applied successfully (Affected rows: " . $conn->affected_rows . ")<br>";
} else {
    echo "Error applying bonus revenue: " . $conn->error . "<br>";
}

// -------------------------------------------------------------
// Task 4: Display each product’s name along with its category name and a label “Top Seller”
// if its revenue is above the average revenue of its own category. Otherwise, display “Regular Seller”.
// -------------------------------------------------------------
echo "<h3>4. Product Seller Status (Top Seller vs Regular Seller)</h3>";
$sql4 = "SELECT s1.ProductName, s1.CategoryName, s1.Revenue,
                CASE 
                    WHEN s1.Revenue > (
                        SELECT AVG(s2.Revenue) 
                        FROM sales_data s2 
                        WHERE s2.CategoryID = s1.CategoryID
                    ) THEN 'Top Seller'
                    ELSE 'Regular Seller'
                END AS SellerStatus
         FROM sales_data s1";
$result4 = $conn->query($sql4);

if ($result4 && $result4->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Product Name</th><th>Category</th><th>Revenue</th><th>Status</th></tr>";
    while ($row = $result4->fetch_assoc()) {
        echo "<tr>
                <td>" . $row["ProductName"] . "</td>
                <td>" . $row["CategoryName"] . "</td>
                <td>" . number_format($row["Revenue"], 2) . "</td>
                <td>" . $row["SellerStatus"] . "</td>
              </tr>";
    }
    echo "</table>";
}

$conn->close();
?>
