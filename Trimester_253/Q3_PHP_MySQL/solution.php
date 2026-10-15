<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "campus_library";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Trimester 253 - Question 3 Solutions</h1>";

// -------------------------------------------------------------
// Task 1: Show total number of books for each Status (Returned, Overdue, Lost),
// but only include statuses that have more than 1 entry in the table
// -------------------------------------------------------------
echo "<h3>1. Total Books per Status (Count > 1)</h3>";
$sql1 = "SELECT Status, COUNT(*) AS TotalBooks 
         FROM book_loans 
         GROUP BY Status 
         HAVING COUNT(*) > 1";
$result1 = $conn->query($sql1);

if ($result1 && $result1->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Status</th><th>Total Books</th></tr>";
    while ($row = $result1->fetch_assoc()) {
        echo "<tr><td>" . $row["Status"] . "</td><td>" . $row["TotalBooks"] . "</td></tr>";
    }
    echo "</table>";
}

// -------------------------------------------------------------
// Task 2: For any student who has a Status of 'Overdue' and DaysOverdue less than 7,
// change their Status to 'Grace Period' and set their PenaltyFee to 0
// -------------------------------------------------------------
echo "<h3>2. Updating Overdue < 7 days to 'Grace Period' with 0 Penalty</h3>";
$sql2 = "UPDATE book_loans 
         SET Status = 'Grace Period', PenaltyFee = 0.00 
         WHERE Status = 'Overdue' AND DaysOverdue < 7";

if ($conn->query($sql2) === TRUE) {
    echo "Updated successfully (Affected rows: " . $conn->affected_rows . ")<br>";
} else {
    echo "Error updating records: " . $conn->error . "<br>";
}

// -------------------------------------------------------------
// Task 3: For students with a PenaltyFee greater than 20.00, increase their fee by 10%
// as a 'processing charge', but only if the final fee does not exceed 50.00
// -------------------------------------------------------------
echo "<h3>3. Increasing PenaltyFee by 10% for Fee > 20.00 (Max Cap 50.00)</h3>";
$sql3 = "UPDATE book_loans 
         SET PenaltyFee = PenaltyFee * 1.10 
         WHERE PenaltyFee > 20.00 AND (PenaltyFee * 1.10) <= 50.00";

if ($conn->query($sql3) === TRUE) {
    echo "Penalty fees updated successfully (Affected rows: " . $conn->affected_rows . ")<br>";
} else {
    echo "Error updating fees: " . $conn->error . "<br>";
}

// -------------------------------------------------------------
// Task 4: Display each BookTitle and the total PenaltyFee collected/owed for that book.
// Sort the results so that the book generating the most money appears at the top.
// -------------------------------------------------------------
echo "<h3>4. Total Penalty Fee per Book Title (Sorted Highest to Lowest)</h3>";
$sql4 = "SELECT BookTitle, SUM(PenaltyFee) AS TotalPenaltyFee 
         FROM book_loans 
         GROUP BY BookTitle 
         ORDER BY TotalPenaltyFee DESC";
$result4 = $conn->query($sql4);

if ($result4 && $result4->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Book Title</th><th>Total Penalty Fee</th></tr>";
    while ($row = $result4->fetch_assoc()) {
        echo "<tr><td>" . $row["BookTitle"] . "</td><td>" . number_format($row["TotalPenaltyFee"], 2) . "</td></tr>";
    }
    echo "</table>";
}

$conn->close();
?>
