<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "uiu_bookshop";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Trimester 261 Set B - Question 3 Solutions</h1>";

// -------------------------------------------------------------
// Task 1: Display all books from the Programming category, sorted by Price in descending order
// -------------------------------------------------------------
echo "<h3>1. Programming Books (Sorted by Price DESC)</h3>";
$sql1 = "SELECT * FROM book_info WHERE Category = 'Programming' ORDER BY Price DESC";
$result1 = $conn->query($sql1);

if ($result1 && $result1->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Book ID</th><th>Title</th><th>Author</th><th>Category</th><th>Price</th><th>Stock</th></tr>";
    while ($row = $result1->fetch_assoc()) {
        echo "<tr>
                <td>{$row['BookID']}</td>
                <td>{$row['BookTitle']}</td>
                <td>{$row['Author']}</td>
                <td>{$row['Category']}</td>
                <td>{$row['Price']}</td>
                <td>{$row['Stock']}</td>
              </tr>";
    }
    echo "</table>";
}

// -------------------------------------------------------------
// Task 2: Display BookTitle, Author, and Price where Price > 400 BDT and Category is 'Programming'
// -------------------------------------------------------------
echo "<h3>2. Programming Books with Price > 400 BDT</h3>";
$sql2 = "SELECT BookTitle, Author, Price 
         FROM book_info 
         WHERE Price > 400 AND Category = 'Programming'";
$result2 = $conn->query($sql2);

if ($result2 && $result2->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Book Title</th><th>Author</th><th>Price (BDT)</th></tr>";
    while ($row = $result2->fetch_assoc()) {
        echo "<tr><td>{$row['BookTitle']}</td><td>{$row['Author']}</td><td>{$row['Price']}</td></tr>";
    }
    echo "</table>";
}

// -------------------------------------------------------------
// Task 3: Display the number of books available in each Category
// -------------------------------------------------------------
echo "<h3>3. Available Books in Each Category</h3>";
$sql3 = "SELECT Category, COUNT(*) AS TotalBookTitles, SUM(Stock) AS TotalStockAvailable 
         FROM book_info 
         GROUP BY Category";
$result3 = $conn->query($sql3);

if ($result3 && $result3->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr><th>Category</th><th>Number of Titles</th><th>Total Stock Available</th></tr>";
    while ($row = $result3->fetch_assoc()) {
        echo "<tr><td>{$row['Category']}</td><td>{$row['TotalBookTitles']}</td><td>{$row['TotalStockAvailable']}</td></tr>";
    }
    echo "</table>";
}

// -------------------------------------------------------------
// Task 4: Display total net worth of the entire bookshop (Price * Stock)
// -------------------------------------------------------------
echo "<h3>4. Total Net Worth of Entire Bookshop</h3>";
$sql4 = "SELECT SUM(Price * Stock) AS TotalNetWorth FROM book_info";
$result4 = $conn->query($sql4);

if ($result4 && $result4->num_rows > 0) {
    $row = $result4->fetch_assoc();
    echo "<b>Total Net Worth: " . number_format($row['TotalNetWorth'], 2) . " BDT</b><br>";
}

// -------------------------------------------------------------
// Task 5: Apply a 10% price reduction to all books in 'Language' category,
// then display BookTitle and updated Price of those books.
// -------------------------------------------------------------
echo "<h3>5. Apply 10% Price Reduction on 'Language' Category</h3>";
$sql5_update = "UPDATE book_info 
                SET Price = Price * 0.90 
                WHERE Category = 'Language'";

if ($conn->query($sql5_update) === TRUE) {
    echo "10% price reduction applied successfully.<br><br>";
    
    // Display updated books in Language category
    $sql5_select = "SELECT BookTitle, Price FROM book_info WHERE Category = 'Language'";
    $result5 = $conn->query($sql5_select);

    if ($result5 && $result5->num_rows > 0) {
        echo "<table border='1' cellpadding='6'>
                <tr><th>Book Title</th><th>Updated Price (BDT)</th></tr>";
        while ($row = $result5->fetch_assoc()) {
            echo "<tr><td>{$row['BookTitle']}</td><td>" . number_format($row['Price'], 2) . "</td></tr>";
        }
        echo "</table>";
    }
} else {
    echo "Error updating prices: " . $conn->error . "<br>";
}

$conn->close();
?>
