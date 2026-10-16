# UIU CSE4165 / CSE465 Web Programming — Ultimate Master Exam Cheatsheet

> **Time: 1 hr 55 min | 30 Marks (Q1: 10M, Q2: 10M, Q3: 10M)**  
> **Recommended Time Budget:** Q1: 30m | Q2: 35m | Q3: 40m | Zip & Submit: 10m  
> **Merged Edition:** Combines State Trackers, Formula Engines, Business Logic, and the Complete 15 SQL Query Archetypes with Past Exam Trimester Tags (242, 243, 251, 252, 253, 261).

---

## Part 1: Question 1 — JavaScript & DOM (10 Marks)

### Universal HTML Architecture (`index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Exam Application</title>
</head>
<body>
    <h2>Exam Application</h2>
    <input type="text" id="inputA" placeholder="Name / Subject / Password">
    <input type="number" id="inputB" step="any" placeholder="Value / Hours / Score">

    <button id="actionBtn" type="button">Submit / Calculate</button>
    <br><br>
    
    <label id="outLabel"></label>

    <script src="script.js"></script>
</body>
</html>
```

---

### Type 1A: Running Total, String Array & Goal Progress Tracker
*Common in: Trimester 252 (Daily Calories), Trimester 261 Set A (Weekly Study Tracker)*

```javascript
const GOAL = 20; // 2000 kcal or 20 hours
let total = 0;
let count = 0;
const historyList = []; // Declared OUTSIDE function so it persists across clicks

const inputA = document.getElementById("inputA");
const inputB = document.getElementById("inputB");
const actionBtn = document.getElementById("actionBtn");
const outLabel = document.getElementById("outLabel");

function handleAction() {
    const name = inputA.value.trim();
    const val = parseFloat(inputB.value);

    // 1. Validation
    if (!name || isNaN(val) || val <= 0) {
        alert("Please enter a valid name and positive value.");
        return;
    }

    // 2. State update
    count++;
    total += val;
    historyList.push(name); // To avoid duplicates: if (!historyList.includes(name)) historyList.push(name);

    // 3. Average calculation
    const avg = total / count;

    // 4. 4-Tier Feedback Ladder (Use <= chained to prevent gaps)
    let feedback = "";
    if (total <= 5) {
        feedback = "Start practicing regularly!";
    } else if (total <= 12) {
        feedback = "Good progress!";
    } else if (total <= 19) {
        feedback = "Almost ready!";
    } else {
        feedback = "Goal reached successfully!";
    }

    // 5. Signature repetition/snacking warning (> N attempts without reaching goal)
    if (count > 7 && total < GOAL) {
        feedback = "Increase your study time / Be cautious of frequent snacking!";
    }

    // 6. Format array and display ONCE (prevents innerHTML overwriting bug)
    const formattedItems = `[${historyList.join(", ")}]`;
    outLabel.innerHTML = `Total: ${total} | Average: ${parseFloat(avg.toFixed(2))} | Items: ${formattedItems} | Feedback: <b>${feedback}</b>`;

    // 7. Clear inputs
    inputA.value = "";
    inputB.value = "";
    inputA.focus();
}

actionBtn.addEventListener("click", handleAction);
```

---

### Type 1B: Criteria & Points Scorer (Password Strength)
*Common in: Trimester 251 (Password Strength Tester)*

```javascript
let attempts = 0;
const inputA = document.getElementById("inputA");
const actionBtn = document.getElementById("actionBtn");
const outLabel = document.getElementById("outLabel");

function checkPasswordStrength() {
    const password = inputA.value;
    attempts++;
    let score = 0;

    // 1. Minimum length criteria (e.g. +10 pts for every 2 chars beyond 6)
    if (password.length >= 6) {
        score += Math.floor((password.length - 6) / 2) * 10;
    }

    // 2. Character set checks using Regex
    if (/[A-Z]/.test(password)) score += 15; // Uppercase
    if (/[a-z]/.test(password)) score += 15; // Lowercase
    if (/[0-9]/.test(password)) score += 20; // Number
    if (/[!@#$%^&*]/.test(password)) score += 25; // Special Character

    // 3. 5-Tier Level Classification
    let level = "";
    if (score <= 30) level = "Very Weak";
    else if (score <= 50) level = "Weak";
    else if (score <= 70) level = "Medium";
    else if (score <= 90) level = "Strong";
    else level = "Very Strong";

    let message = (score >= 100) ? "Perfect Password! Success!" : `Score: ${score} - ${level}`;

    // 4. Warning condition (Attempts > 8 without reaching Strong [score >= 71])
    if (attempts > 8 && score < 71) {
        message += " | Need practice! Tips: Add uppercase letters, digits, and symbols.";
    }

    outLabel.innerHTML = message;
}

actionBtn.addEventListener("click", checkPasswordStrength);
```

---

### Type 1C: Multi-Sensor & Formula Evaluator (Patient Vitals)
*Common in: Trimester 261 Set B (Heart Rate & SpO2)*

```javascript
const readingsA = [];
const readingsB = [];

const inputA = document.getElementById("inputA"); // Heart Rate
const inputB = document.getElementById("inputB"); // SpO2
const actionBtn = document.getElementById("actionBtn");
const outLabel = document.getElementById("outLabel");

function evaluateVitals() {
    const hr = parseFloat(inputA.value);
    const spo2 = parseFloat(inputB.value);

    if (isNaN(hr) || isNaN(spo2) || hr <= 0 || spo2 <= 0 || spo2 > 100) {
        alert("Enter valid numbers (SpO2 between 1 and 100).");
        return;
    }

    readingsA.push(hr);
    readingsB.push(spo2);

    // Averages across all readings entered so far
    const avgHR = readingsA.reduce((sum, n) => sum + n, 0) / readingsA.length;
    const avgSpO2 = readingsB.reduce((sum, n) => sum + n, 0) / readingsB.length;

    // Exam Formula: RiskScore = (100 - SpO2) * 2 + |HR - 80| * 0.5
    const riskScore = (100 - spo2) * 2 + Math.abs(hr - 80) * 0.5;

    let status = "";
    if (riskScore <= 10) status = "SAFE";
    else if (riskScore <= 20) status = "WARNING";
    else status = "DANGER";

    outLabel.innerHTML = `Avg HR: ${avgHR.toFixed(1)} | Avg SpO2: ${avgSpO2.toFixed(1)}% | Risk Score: ${riskScore.toFixed(1)} | Status: <b>${status}</b>`;

    inputA.value = "";
    inputB.value = "";
}

actionBtn.addEventListener("click", evaluateVitals);
```

---

### JS Quick Reference & Gotchas
| Operation | JavaScript Syntax | Common Gotcha |
| :--- | :--- | :--- |
| **Parse Float / Int** | `parseFloat(el.value)`, `parseInt(el.value)` | Reading `.value` at file level runs before user types! Always read inside function. |
| **Check Number** | `isNaN(val)`, `val <= 0` | Empty inputs become `0` when coerced with `Number("")`. Use `trim()` check. |
| **Array Storing** | `arr.push(val)` | Declare `const arr = [];` outside the function so it doesn't clear on click. |
| **Array Output** | `arr.join(", ")` or `` `[${arr.join(", ")}]` `` | Calling `el.innerHTML = ...` multiple times overwrites itself. Assign once! |
| **Math Rounding** | `val.toFixed(2)` | `toFixed()` returns a **string**. Wrap in `parseFloat()` if math needed. |
| **Regex Test** | `/[A-Z]/.test(str)` | Returns `true` or `false`. |
| **Absolute Value** | `Math.abs(a - b)` | Used for difference from baseline. |

---

## Part 2: Question 2 — PHP Form Processing & Business Logic (10 Marks)

### Universal 3-Input HTML Form (`index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Calculation System</title>
</head>
<body>
    <h2>Calculation System</h2>
    <form action="calculate.php" method="POST">
        <label for="val1">Attendees / Production Rate / CT1:</label><br>
        <input type="number" id="val1" name="val1" step="any" required><br><br>

        <label for="val2">Cost Per Person / Days / CT2:</label><br>
        <input type="number" id="val2" name="val2" step="any" required><br><br>

        <label for="val3">Unit Capacity / Target / CT3:</label><br>
        <input type="number" id="val3" name="val3" step="any" required><br><br>

        <input type="submit" value="Calculate">
    </form>
</body>
</html>
```

---

### Type 2A: Resource Ceiling Allocation & Waste Math (`calculate.php`)
*Common in: Trimester 251 (Tech Fest Venue), Trimester 252 (Movie Screen Rental), Trimester 261 Set B (Mars Rover Battery)*

```php
<?php
function calculateBooking($people, $costPerPerson, $capacity) {
    // 1. Partial units cannot be rented: always round UP using ceil()
    $unitsNeeded = ceil($people / $capacity);

    // 2. Total capacity and empty/unused slots
    $totalCapacity = $unitsNeeded * $capacity;
    $emptyUnits = $totalCapacity - $people;

    // 3. Financial loss / wasted money
    $wastedMoney = $emptyUnits * $costPerPerson;

    // 4. Efficiency status (% unused of total capacity)
    $unusedPct = ($totalCapacity > 0) ? ($emptyUnits / $totalCapacity) * 100 : 0;
    
    $status = "";
    if ($unusedPct <= 10) {
        $status = "Efficient";
    } elseif ($unusedPct <= 25) {
        $status = "Acceptable";
    } else {
        $status = "Wasteful";
    }

    return [
        'units' => $unitsNeeded,
        'empty' => $emptyUnits,
        'waste' => $wastedMoney,
        'pct' => $unusedPct,
        'status' => $status
    ];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $v1 = floatval($_POST['val1']);
    $v2 = floatval($_POST['val2']);
    $v3 = floatval($_POST['val3']);

    $r = calculateBooking($v1, $v2, $v3);

    echo "<h2>Resource Allocation Report</h2>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr>
            <th>Required</th><th>Unit Cost</th><th>Capacity</th>
            <th>Units Booked</th><th>Unused Units</th><th>Wasted Cost (BDT)</th><th>Status</th>
          </tr>";
    echo "<tr>
            <td>{$v1}</td><td>{$v2}</td><td>{$v3}</td>
            <td>{$r['units']}</td><td>{$r['empty']}</td>
            <td>" . number_format($r['waste'], 2) . "</td>
            <td>{$r['status']}</td>
          </tr>";
    echo "</table>";
    echo "<br><a href='index.html'>Back</a>";
}
?>
```

---

### Type 2B: Production Rate × Days vs Target Comparison (`calculate.php`)
*Common in: Trimester 253 (Event Sales Tracker), Trimester 261 Set A (Graduation Credits)*

```php
<?php
function evaluateTargetPerformance($rate, $duration, $target) {
    $total = $rate * $duration; // e.g. items/day * days OR credits/course * courses

    // 4 Performance Tiers
    $category = "";
    if ($total >= 500) {
        $category = "Excellent";
    } elseif ($total >= 300) {
        $category = "Good";
    } elseif ($total >= 150) {
        $category = "Average";
    } else {
        $category = "Poor";
    }

    // Difference from target calculation
    $diff = $total - $target;
    if ($diff == 0) {
        $diffMsg = "Target met exactly (0 difference)";
    } elseif ($diff > 0) {
        $diffMsg = "Above target by " . $diff;
    } else {
        $diffMsg = "Below target by " . abs($diff);
    }

    return ['total' => $total, 'category' => $category, 'diffMsg' => $diffMsg];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $r = floatval($_POST['val1']);
    $d = floatval($_POST['val2']);
    $t = floatval($_POST['val3']);

    $res = evaluateTargetPerformance($r, $d, $t);

    echo "<h2>Performance Report</h2>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr><th>Total Units</th><th>Category</th><th>Target Comparison</th></tr>";
    echo "<tr><td>{$res['total']}</td><td>{$res['category']}</td><td>{$res['diffMsg']}</td></tr>";
    echo "</table>";
    echo "<br><a href='index.html'>Back</a>";
}
?>
```

---

### Type 2C: Best 2 of 3 CT Marks & Pass/Fail (`calculate.php`)
*Common in: Trimester 253 Q1*

```php
<?php
function processStudentMarks($ct1, $ct2, $ct3, $mid, $final) {
    // Best 2 CTs average: sum of three minus the lowest, divided by 2
    $bestTwoAvg = (($ct1 + $ct2 + $ct3) - min($ct1, $ct2, $ct3)) / 2.0;
    $grandTotal = $bestTwoAvg + $mid + $final;
    $status = ($grandTotal > 54) ? "Passed" : "Failed";

    return ['ctAvg' => $bestTwoAvg, 'grandTotal' => $grandTotal, 'status' => $status];
}
?>
```

---

### PHP Quick Reference & Gotchas
| Operation | PHP Syntax | Common Gotcha |
| :--- | :--- | :--- |
| **String Joining** | `$str1 . $str2` | In PHP, string concatenation uses dot `.`, not `+`! |
| **Ceil Rounding** | `ceil($a / $b)` | `ceil()` always rounds up (e.g., `ceil(10.1)` &rarr; `11`). Returns float. |
| **Number Formatting** | `number_format($num, 2)` | Outputs comma thousands and exact decimals (e.g. `1,250.00`). |
| **Absolute Difference** | `abs($a - $b)` | Guarantees non-negative distance. |
| **Read POST Values** | `floatval($_POST['key'])` | Always sanitize with `floatval()` or `intval()`. |
| **Array Sum & Count** | `array_sum($arr)`, `count($arr)` | For calculating averages of dynamic sets. |

---

## Part 3: Question 3 — PHP & MySQL Complete Integration (10 Marks)

### Step 1: Database Setup Script (`database.sql`)
```sql
CREATE DATABASE IF NOT EXISTS exam_db;
USE exam_db;

DROP TABLE IF EXISTS items;
CREATE TABLE items (
    ItemID INT PRIMARY KEY,
    ItemName VARCHAR(100),
    Category VARCHAR(50),
    Price DECIMAL(10, 2),
    Stock INT,
    Rating DECIMAL(3, 1),
    SaleDate DATE,
    Status VARCHAR(50)
);

INSERT INTO items (ItemID, ItemName, Category, Price, Stock, Rating, SaleDate, Status) VALUES
(1, 'Laptop',     'Electronics', 50000.00, 5,   4.8, '2024-01-01', 'Sold'),
(2, 'Mouse',      'Electronics', 500.00,   20,  4.2, '2024-01-02', 'Sold'),
(3, 'Chair',      'Furniture',   3000.00,  8,   4.5, '2024-01-02', 'Pending'),
(4, 'Desk',       'Furniture',   7200.00,  6,   4.1, '2024-01-03', 'Sold'),
(5, 'Bottle',     'Accessories', 150.00,   40,  3.9, '2024-01-03', 'Returned'),
(6, 'Cox''s Pen', 'Accessories', 20.00,    100, 4.6, '2024-01-03', 'Returned');
```
> [!NOTE]
> In SQL strings, escape an apostrophe by doubling it: `'Cox''s Pen'`. Dates are always `'YYYY-MM-DD'`.

---

### Step 2: Complete PHP-MySQL Execution Runner (`solution.php`)
```php
<?php
$conn = new mysqli("localhost", "root", "", "exam_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 1. Dynamic Table Renderer (Auto-detects column names)
function showTable($conn, $title, $sql) {
    echo "<h3>" . htmlspecialchars($title) . "</h3>";
    $res = $conn->query($sql);
    if (!$res) {
        echo "<p style='color:red;'>SQL Error: " . $conn->error . "</p>";
        return;
    }
    if ($res->num_rows > 0) {
        echo "<table border='1' cellpadding='6' cellspacing='0'><tr>";
        while ($f = $res->fetch_field()) {
            echo "<th>" . htmlspecialchars($f->name) . "</th>";
        }
        echo "</tr>";
        while ($row = $res->fetch_assoc()) {
            echo "<tr>";
            foreach ($row as $v) {
                echo "<td>" . htmlspecialchars($v) . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>0 results found.</p>";
    }
}

// 2. Safe Update Runner
function runUpdate($conn, $title, $sql) {
    echo "<h3>" . htmlspecialchars($title) . "</h3>";
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color:green;'>Updated successfully! Affected rows: " . $conn->affected_rows . "</p>";
    } else {
        echo "<p style='color:red;'>Update error: " . $conn->error . "</p>";
    }
}

// 3. Single Scalar Extractor
function showSingle($conn, $title, $sql, $colName) {
    $res = $conn->query($sql);
    if ($res && $row = $res->fetch_assoc()) {
        echo "<p><b>" . htmlspecialchars($title) . ": " . number_format($row[$colName], 2) . "</b></p>";
    }
}

// ==========================================
// RUNNING THE 4 EXAM TASKS IN SEQUENCE:
// ==========================================

// Task 1: GROUP BY Summary with HAVING & ORDER BY
showTable($conn, "Task 1: Category Summary (Rating > 4.4)", 
    "SELECT Category, COUNT(*) AS TotalItems, AVG(Rating) AS AvgRating, SUM(Stock) AS TotalStock 
     FROM items GROUP BY Category HAVING AVG(Rating) > 4.4 ORDER BY AvgRating DESC");

// Task 2: Conditional UPDATE with multiple criteria
runUpdate($conn, "Task 2: Status Update for Low Price & Not Returned", 
    "UPDATE items SET Status = 'Discounted' WHERE Price < 1000 AND Status <> 'Returned'");

// Task 3: Bonus / Increment with Upper Ceiling Cap
runUpdate($conn, "Task 3: Fixed Bonus with Upper Limit", 
    "UPDATE items SET Price = Price + 500 WHERE Price > 300 AND (Price + 500) <= 60000");

// Task 4: Relative Average Comparison (Subquery)
showTable($conn, "Task 4: Item Classification Against Category Average", 
    "SELECT i.ItemName, i.Category, i.Price, 
            CASE WHEN i.Price > (SELECT AVG(i2.Price) FROM items i2 WHERE i2.Category = i.Category) 
                 THEN 'Top Seller' ELSE 'Regular Seller' END AS Tier 
     FROM items i ORDER BY i.Price DESC");

// Whole Table Net Worth
showSingle($conn, "Total Net Worth", "SELECT SUM(Price * Stock) AS NetWorth FROM items", "NetWorth");

$conn->close();
?>
```

---

## Part 4: The 15 SQL Query Archetypes Encyclopedia (All Past Exams)

All queries below run directly on the standard `items` table above:

| # | Archetype Description | Exam Papers | Exact SQL Command |
| :---: | :--- | :---: | :--- |
| **1** | **Count rows per group** | 243, 251, 253, 261 | `SELECT Category, COUNT(*) AS Total FROM items GROUP BY Category;` |
| **2** | **Total & average per group** | 242, 252 | `SELECT Category, SUM(Price) AS Revenue, AVG(Price) AS AvgPrice FROM items GROUP BY Category;` |
| **3** | **Groups with more than 1 row (HAVING)** | 253 | `SELECT Status, COUNT(*) AS Total FROM items GROUP BY Status HAVING COUNT(*) > 1;` |
| **4** | **Top N by date range & limit** | 242 | `SELECT SaleDate, SUM(Price) AS Revenue FROM items WHERE SaleDate BETWEEN '2024-01-01' AND '2024-01-31' GROUP BY SaleDate ORDER BY Revenue DESC LIMIT 2;` |
| **5** | **OR condition with substring LIKE** | 261 | `SELECT ItemName, Category, Rating FROM items WHERE Rating > 4.5 OR ItemName LIKE '%Pen%' ORDER BY Rating DESC;` |
| **6** | **Multi-condition filter (AND)** | 261 | `SELECT ItemName, Price FROM items WHERE Price > 400 AND Category = 'Electronics';` |
| **7** | **Whole-table aggregation (Net Worth)** | 261 | `SELECT SUM(Price * Stock) AS NetWorth FROM items;` |
| **8** | **Count + Avg + Sum with HAVING > threshold** | 261 | `SELECT Category, COUNT(*) AS Items, AVG(Rating) AS AvgRating, SUM(Stock) AS TotalStock FROM items GROUP BY Category HAVING AVG(Rating) > 4.4 ORDER BY AvgRating DESC;` |
| **9** | **Calculated expression in HAVING** | 261 | `SELECT Category, SUM(Price * Stock) AS CategoryVal FROM items GROUP BY Category HAVING SUM(Price * Stock) > 100000 ORDER BY CategoryVal DESC;` |
| **10** | **Distinct occurrences per group** | 242 | `SELECT Category, AVG(Stock) FROM items GROUP BY Category HAVING COUNT(DISTINCT SaleDate) >= 2;` |
| **11** | **Relative comparison vs Category Average (Subquery)** | 252 | `SELECT i.ItemName, i.Price, CASE WHEN i.Price > (SELECT AVG(i2.Price) FROM items i2 WHERE i2.Category = i.Category) THEN 'Top Seller' ELSE 'Regular Seller' END AS Status FROM items i;` |
| **12** | **Conditional Update with NOT EQUAL `<>`** | 243, 251, 252, 253 | `UPDATE items SET Status = 'Low' WHERE Price < 1000 AND Status <> 'Returned';` |
| **13** | **Bonus/Increment with Upper Ceiling Cap** | 243, 251 | `UPDATE items SET Price = Price + 5000 WHERE Price > 3000 AND (Price + 5000) <= 60000;` |
| **14** | **Percentage raise (`* 1.10`) or discount (`* 0.90`)** | 252, 253, 261 | `UPDATE items SET Price = Price * 0.90 WHERE Category = 'Furniture';` |
| **15** | **Update multiple columns simultaneously** | 261 | `UPDATE items SET Rating = Rating + 0.2, Price = Price * 1.10 WHERE Rating BETWEEN 4.0 AND 4.5 AND Price > 0;` |

---

## Part 5: Exam Wording &rarr; SQL Mapping Dictionary

| When Question States: | Exact SQL Structure to Write: |
| :--- | :--- |
| *"For each category / department / spot..."* | `GROUP BY Category` *(Must include Category in SELECT)* |
| *"Total number of entries in each group..."* | `SELECT Category, COUNT(*) AS Total FROM items GROUP BY Category;` |
| *"Only include groups where average rating exceeds 4.0..."* | `GROUP BY Category HAVING AVG(Rating) > 4.0` |
| *"Sorted from highest to lowest / descending..."* | `ORDER BY col_name DESC` |
| *"Sorted from lowest to highest / ascending..."* | `ORDER BY col_name ASC` |
| *"Spot name contains the word 'Beach'..."* | `WHERE SpotName LIKE '%Beach%'` |
| *"Rating between 4.0 and 4.5 (inclusive)..."* | `WHERE Rating BETWEEN 4.0 AND 4.5` |
| *"If salary < 40,000 and rating is not 'D', set to 'C'..."* | `UPDATE employees SET Rating = 'C' WHERE Salary < 40000 AND Rating <> 'D'` |
| *"Add 5,000 bonus, only if resulting salary does not exceed 60,000..."* | `UPDATE employees SET Salary = Salary + 5000 WHERE Salary > 50000 AND (Salary + 5000) <= 60000` |
| *"Increase fee by 10% / 10% bonus..."* | `UPDATE items SET Fee = Fee * 1.10 WHERE Condition...` |
| *"Apply 10% discount / reduce by 10%..."* | `UPDATE items SET Price = Price * 0.90 WHERE Condition...` |
| *"Total estimated revenue across all items..."* | `SELECT SUM(Price * Stock) AS TotalNetWorth FROM items;` |
| *"Mark as 'Top Seller' if price exceeds its own category average..."* | `CASE WHEN Price > (SELECT AVG(Price) FROM items t2 WHERE t2.Category = t.Category) THEN 'Top Seller' ELSE 'Regular Seller' END` |
| *"Change two columns at the same time..."* | `UPDATE items SET Status = 'Grace Period', Fee = 0.00 WHERE Condition...` |

---

## Part 6: Zero-Crash Emergency Trap List

* **TRAP 1: Never put `COUNT(*)`, `SUM()`, or `AVG()` in a `WHERE` clause!**  
  * ❌ `WHERE AVG(Rating) > 4.0` &rarr; Crashes with SQL syntax error.  
  * ✅ `GROUP BY Category HAVING AVG(Rating) > 4.0`  
* **TRAP 2: Always execute queries in the exact order listed on the question paper!**  
  * Updating a row in Task 2 affects what rows appear in Task 3 and Task 4.
* **TRAP 3: Avoid `innerHTML` overwriting!**  
  * In JS, assigning `el.innerHTML = ...` multiple times in a row erases previous values. Formulate one combined template literal string and assign once.
* **TRAP 4: URL vs Local File path in Browser!**  
  * For PHP, always visit `http://localhost/exam_folder/index.html` via XAMPP. Never double click `.php` files from desktop explorer.
* **TRAP 5: SQL string quotes & apostrophes!**  
  * Column names use backticks `` `col` `` (or no quotes). String literals use single quotes `'val'`. Escape apostrophes with two single quotes: `'Cox''s Bazar'`.
* **TRAP 6: String concatenation difference!**  
  * JavaScript uses `+` (`"Total: " + total`).  
  * PHP uses `.` (`"Total: " . $total`).
