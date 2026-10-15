<?php
// Database connection parameters
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "uiutech_final";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Trimester 251 - Question 3 Solutions</h1>";

// -------------------------------------------------------------
// Task 1: Show total number of employees who received each performance rating (A, B, C, D) across all departments
// -------------------------------------------------------------
echo "<h3>1. Total Employees by Performance Rating</h3>";
$sql1 = "SELECT PerformanceRating, COUNT(*) AS TotalCount 
         FROM employee_final 
         GROUP BY PerformanceRating";
$result1 = $conn->query($sql1);

if ($result1 && $result1->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Performance Rating</th><th>Total Employees</th></tr>";
    while ($row = $result1->fetch_assoc()) {
        echo "<tr><td>" . $row["PerformanceRating"] . "</td><td>" . $row["TotalCount"] . "</td></tr>";
    }
    echo "</table>";
} else {
    echo "0 results found.<br>";
}

// -------------------------------------------------------------
// Task 2: If an employee has a salary below 40,000 BDT and their current performance rating is not 'D', change their performance rating to 'C'
// -------------------------------------------------------------
echo "<h3>2. Updating Performance Rating to 'C' for Salary < 40,000 BDT (excluding rating 'D')</h3>";
$sql2 = "UPDATE employee_final 
         SET PerformanceRating = 'C' 
         WHERE Salary < 40000 AND PerformanceRating != 'D'";

if ($conn->query($sql2) === TRUE) {
    echo "Records updated successfully (Affected rows: " . $conn->affected_rows . ")<br>";
} else {
    echo "Error updating record: " . $conn->error . "<br>";
}

// -------------------------------------------------------------
// Task 3: If an employee has a salary greater than 50,000 BDT, add a 5,000 BDT bonus to their salary, but only if the resulting salary is less than or equal to 60,000 BDT
// -------------------------------------------------------------
echo "<h3>3. Adding 5,000 BDT Bonus for Salary > 50,000 BDT (if resulting salary <= 60,000 BDT)</h3>";
$sql3 = "UPDATE employee_final 
         SET Salary = Salary + 5000 
         WHERE Salary > 50000 AND (Salary + 5000) <= 60000";

if ($conn->query($sql3) === TRUE) {
    echo "Bonus applied successfully (Affected rows: " . $conn->affected_rows . ")<br>";
} else {
    echo "Error updating salary bonus: " . $conn->error . "<br>";
}

// -------------------------------------------------------------
// Task 4: For each department, display the department names and the number of employees working in that department, sorted by the number of employees (largest department first)
// -------------------------------------------------------------
echo "<h3>4. Departments and Employee Counts (Largest First)</h3>";
$sql4 = "SELECT DepartmentName, COUNT(*) AS EmployeeCount 
         FROM employee_final 
         GROUP BY DepartmentName 
         ORDER BY EmployeeCount DESC";
$result4 = $conn->query($sql4);

if ($result4 && $result4->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Department Name</th><th>Number of Employees</th></tr>";
    while ($row = $result4->fetch_assoc()) {
        echo "<tr><td>" . $row["DepartmentName"] . "</td><td>" . $row["EmployeeCount"] . "</td></tr>";
    }
    echo "</table>";
} else {
    echo "0 results found.<br>";
}

// Close connection
$conn->close();
?>
