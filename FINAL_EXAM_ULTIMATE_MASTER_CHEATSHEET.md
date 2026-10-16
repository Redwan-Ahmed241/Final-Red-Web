# UIU CSE4165 / CSE465 Web Programming — Ultimate Master Exam Cheatsheet

> **Time: 1 hr 55 min | 30 Marks (Q1: 10M, Q2: 10M, Q3: 10M)**  
> **Recommended Time Budget:** Q1: 30m | Q2: 35m | Q3: 40m | Zip & Submit: 10m  
> **Merged Edition:** Combines State Trackers, Formula Engines, Business Logic, and the Complete 15 SQL Query Archetypes with Past Exam Trimester Tags (242, 243, 251, 252, 253, 261).

---

## Part 1: Question 1 — JavaScript & DOM (10 Marks)

### Minimal HTML Architecture (`index.html`)
```html
<!DOCTYPE html>
<html>
<body>
    <h2>Tracker</h2>
    <input type="text" id="a" placeholder="Subject / Meal"><br><br>
    <input type="number" id="b" placeholder="Hours / Calories"><br><br>
    <button onclick="add()">Submit</button>
    <div id="res"></div>
    <script src="script.js"></script>
</body>
</html>
---

### All Input Controls & DOM Reading Rules (Dropdown, Radio, Checkbox, Textarea)
```html
<!-- 1. Text & Number Inputs -->
<input type="text" id="a" placeholder="Subject / Meal">
<input type="number" id="b" placeholder="Hours / Calories">

<!-- 2. Dropdown (<select>) -->
<select id="loc">
    <option value="">Select Location</option>
    <option value="Dhaka">Dhaka</option>
    <option value="Chittagong">Chittagong</option>
</select>

<!-- 3. Radio Buttons (Give both the SAME name="area" so only ONE can be selected!) -->
<input type="radio" name="area" id="urb" value="Urban"> Urban
<input type="radio" name="area" id="rur" value="Rural"> Rural

<!-- 4. Checkbox -->
<input type="checkbox" id="chk" value="yes"> I agree

<!-- 5. Textarea -->
<textarea id="msg" placeholder="Comments"></textarea>

<!-- Button, Output & Script -->
<button id="btn" onclick="add()">Submit</button>
<div id="res"></div>
<script src="script.js"></script>
```

#### How to Read Each Input in JavaScript:
```javascript
// Text & Number:
let subject = document.getElementById("a").value;
let hours   = Number(document.getElementById("b").value);

// Dropdown (<select>):
let location = document.getElementById("loc").value;

// Radio Buttons (.checked returns true or false):
let isUrban = document.getElementById("urb").checked;
let isRural = document.getElementById("rur").checked;

// Checkbox (.checked returns true or false):
let isAgreed = document.getElementById("chk").checked;

// Textarea:
let comments = document.getElementById("msg").value;

// Read text from normal div / span / h3:
let divText = document.getElementById("res").textContent; // or .innerText

// Disable a button / input:
document.getElementById("btn").disabled = true;

// Change style / color dynamically:
document.getElementById("res").style.color = (total >= 100) ? "green" : "red";

// Clear an input box:
document.getElementById("a").value = "";
```

> [!IMPORTANT]
> **Core DOM Rule:**  
> For input controls (`<input>`, `<select>`, `<textarea>`), you **NEVER** use `.innerHTML`. You use **`.value`** (or **`.checked`** for radio/checkbox).  
> For display tags (`<div>`, `<p>`, `<span>`, `<h3>`, `<td>`), you use **`.innerHTML`** or **`.textContent`**!

---

### Minimal JavaScript State Tracker (`script.js`)
*You can track strings in TWO simple ways:*

#### Way A: Simple String Accumulator (No Array Needed! Just like `total += val`):
```javascript
let total = 0, count = 0;
let items = ""; // String accumulator!

function add() {
    let name = document.getElementById("a").value;
    let val = Number(document.getElementById("b").value);
    if (!name || isNaN(val) || val <= 0) return alert("Invalid input");

    count++;
    total += val;
    items += name + ", "; // Adds to string just like count++!

    let avg = total / count;
    let msg = "";

    if (total <= 5)       msg = "Start studying regularly!";
    else if (total <= 12) msg = "Good progress!";
    else if (total <= 19) msg = "Almost ready!";
    else                  msg = "Goal reached!";

    if (count > 7 && total < 20) msg = "Increase your study time!";

    // Simple line-by-line print:
    document.getElementById("res").innerHTML = 
        "Total: " + total + "<br>" +
        "Average: " + avg.toFixed(2) + "<br>" +
        "Subjects: [" + items.slice(0, -2) + "]<br>" +
        "Status: " + msg;

    document.getElementById("a").value = "";
    document.getElementById("b").value = "";
}
```

#### Way B: Simple Array Method (`push` & `join`):
```javascript
let total = 0, count = 0;
const list = []; // Array outside function

function add() {
    let name = document.getElementById("a").value;
    let val = Number(document.getElementById("b").value);
    if (!name || isNaN(val) || val <= 0) return alert("Invalid input");

    count++;
    total += val;
    list.push(name); // Adds to array

    let avg = total / count;
    let msg = (total <= 5) ? "Low" : (total <= 12) ? "Mid" : "Goal reached!";
    if (count > 7 && total < 20) msg = "Warning!";

    document.getElementById("res").innerHTML = 
        "Total: " + total + "<br>" +
        "Average: " + avg.toFixed(2) + "<br>" +
        "Subjects: [" + list.join(", ") + "]<br>" +
        "Status: " + msg;

    document.getElementById("a").value = "";
    document.getElementById("b").value = "";
}
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
---

### JS Objects, JSON Conversion, Array Methods & Random Numbers
```javascript
// 1. JavaScript Objects:
let student = {
    name: "Swaron",
    id: "0112230418",
    cgpa: 3.63
};
// Properties can be accessed in 2 ways:
let sName = student.name;
let sId   = student["id"];

// 2. JSON Conversion:
// Convert JS Object -> JSON String (for sending over network / storing)
let jsonString = JSON.stringify(student);

// Convert JSON String -> Back to JS Object
let parsedStudent = JSON.parse(jsonString);
console.log(parsedStudent.name, parsedStudent.cgpa);

// 3. Array STL Methods:
let arr = ["Apple", "Banana"];
arr.push("Mango");      // Adds to end
arr.pop();              // Removes from end
arr.unshift("Orange");  // Adds to beginning
arr.shift();            // Removes from beginning
arr.includes("Apple");  // Returns true / false
arr.indexOf("Banana");  // Returns index or -1
arr.sort();             // Sorts alphabetically / numerically
arr.reverse();          // Reverses array
arr.join(", ");         // Converts to string: "Orange, Apple, Banana"
arr.length;             // Total count of elements

// 4. Random Integer Generator (Between min and max inclusive):
// e.g. Dice roll between 1 and 6:
let min = 1, max = 6;
let randInt = Math.floor(Math.random() * (max - min + 1)) + min;
```

---

## Part 2: Question 2 — PHP Form Processing & Business Logic (10 Marks)

### Minimal HTML Form (`index.html` — Includes Dropdown, Radio & Checkbox)
```html
<!DOCTYPE html>
<html>
<body>
    <!-- Minimal form: only action, method, and name attributes needed -->
    <form action="calculate.php" method="POST">
        <input type="number" name="a" placeholder="First Input" step="any"><br><br>
        <input type="number" name="b" placeholder="Second Input" step="any"><br><br>
        <input type="number" name="c" placeholder="Third Input" step="any"><br><br>

        <!-- Dropdown in PHP Form -->
        <select name="category">
            <option value="Tech">Tech</option>
            <option value="Furniture">Furniture</option>
        </select><br><br>

        <!-- Radio Buttons in PHP Form -->
        <input type="radio" name="area" value="Urban" checked> Urban
        <input type="radio" name="area" value="Rural"> Rural<br><br>

        <!-- Checkbox in PHP Form -->
        <input type="checkbox" name="discount" value="yes"> Apply Discount<br><br>

        <button type="submit">Calculate</button>
    </form>
</body>
</html>
```

#### How PHP Reads Each Form Input (`calculate.php`):
```php
<?php
// Numbers & Text:
$num1 = floatval($_POST['a']);
$num2 = floatval($_POST['b']);

// Dropdown (<select>):
$cat = $_POST['category'];

// Radio Buttons (receives the value of the checked radio):
$area = $_POST['area']; // "Urban" or "Rural"

// Checkbox (Check with isset()! If unticked, browser doesn't send it at all):
$hasDiscount = isset($_POST['discount']); // true if ticked, false if unticked

// PHP Arrays & Loops:
$fruits = ["Apple", "Banana", "Mango", "Orange"];
// Loop with for:
for ($i = 0; $i < count($fruits); $i++) {
    echo $fruits[$i] . "<br>";
}
// Loop with foreach:
foreach ($fruits as $fruit) {
    echo $fruit . "<br>";
}

// PHP Useful Math:
// ceil($a / $b)   -> Always rounds UP (crucial for capacity allocation!)
// min($a, $b, $c) -> Minimum of numbers
// max($a, $b, $c) -> Maximum of numbers
// (int)($a / $b)  -> Integer division (discards decimal without rounding)
// abs($a - $b)    -> Absolute positive difference
```

---

> [!TIP]
> **Exam Writing Strategy:** Do **NOT** write wrapper functions (`function calc(...) { ... }`) unless the question explicitly asks for one! Writing direct, procedural PHP code is much faster, avoids argument passing mistakes, and earns full marks.

### Type 2A: Resource Ceiling Allocation & Waste Math (`calculate.php`)
*Common in: Trimester 251 (Tech Fest Venue), Trimester 252 (Movie Screen Rental), Trimester 261 Set B (Mars Rover Battery)*

```php
<?php
$demand   = floatval($_POST['val1']);
$rate     = floatval($_POST['val2']);
$capacity = floatval($_POST['val3']);

// 1. Cannot book partial units: always round UP using ceil()
$unitsNeeded = ceil($demand / $capacity);

// 2. Empty / Unused capacity & wasted money
$totalCapacity = $unitsNeeded * $capacity;
$emptyUnits = $totalCapacity - $demand;
$wastedMoney = $emptyUnits * $rate;

// 3. Efficiency status (% unused of total capacity)
$unusedPct = ($totalCapacity > 0) ? ($emptyUnits / $totalCapacity) * 100 : 0;
$status = ($unusedPct <= 10) ? "Efficient" : (($unusedPct <= 25) ? "Acceptable" : "Wasteful");

// 4. Output
echo "<h2>Resource Allocation Report</h2>";
echo "Units Booked: " . $unitsNeeded . "<br>";
echo "Unused Units: " . $emptyUnits . "<br>";
echo "Wasted Cost: " . number_format($wastedMoney, 2) . " BDT<br>";
echo "Status: " . $status . "<br>";
?>
```

---

### Type 2B: Production Rate × Days vs Target Comparison (`calculate.php` / `track.php`)
*Common in: Trimester 253 (Event Sales Tracker), Trimester 261 Set A (Graduation Credits)*

```php
<?php
$rate     = floatval($_POST['cred']);        // e.g. credits per course
$duration = floatval($_POST['num_course']);  // e.g. number of courses
$target   = floatval($_POST['tar_cred']);    // e.g. target graduation credits

$total = $rate * $duration;

// 1. 4-Tier Categorization
$category = "Poor";
if ($total >= 120)     $category = "Excellent";
elseif ($total >= 90)  $category = "Good";
elseif ($total >= 60)  $category = "Average";

// 2. Target comparison (Always wrap subtraction in parentheses!)
if ($total == $target) {
    $state = "Exactly at the target (0 difference)";
} elseif ($total > $target) {
    $state = "Above from the target by " . ($total - $target);
} else {
    $state = "Below from the target by " . ($target - $total);
}

// 3. Output
echo "Total credits completed: " . $total . "<br>";
echo "Progress category: " . $category . "<br>";
echo "Target comparison: " . $state . "<br>";
?>
```

---

### Type 2C: Best 2 of 3 CT Marks & Pass/Fail (`calculate.php`)
*Common in: Trimester 253 Q1*

```php
<?php
$ct1   = floatval($_POST['ct1']);
$ct2   = floatval($_POST['ct2']);
$ct3   = floatval($_POST['ct3']);
$mid   = floatval($_POST['mid']);
$final = floatval($_POST['final']);

// Best 2 CTs: sum minus the lowest, divided by 2
$bestTwoAvg = (($ct1 + $ct2 + $ct3) - min($ct1, $ct2, $ct3)) / 2.0;
$grandTotal = $bestTwoAvg + $mid + $final;
$status = ($grandTotal > 54) ? "Passed" : "Failed";

echo "Best 2 CTs Average: " . $bestTwoAvg . "<br>";
echo "Grand Total: " . $grandTotal . "<br>";
echo "Status: <b>" . $status . "</b><br>";
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

### Step 2: Minimal Execution Script (`solution.php` - Direct While Loop)
```php
<?php
$conn = new mysqli("localhost", "root", "", "exam_db");

// Task 1: Category Summary with GROUP BY
echo "<h3>Task 1: Category Summary</h3>";
$res1 = $conn->query("SELECT Category, COUNT(*) AS Total, AVG(Price) AS AvgPrice FROM items GROUP BY Category");
while ($row = $res1->fetch_assoc()) {
    echo $row['Category'] . " - Total: " . $row['Total'] . " - Avg: " . $row['AvgPrice'] . "<br>";
}

// Task 2: Conditional UPDATE
$conn->query("UPDATE items SET Status = 'Discount' WHERE Price < 1000 AND Status <> 'Returned'");
echo "Task 2 Updated!<br>";

// Task 3: Bonus / Increment with Ceiling Cap
$conn->query("UPDATE items SET Price = Price + 500 WHERE Price > 300 AND (Price + 500) <= 60000");
echo "Task 3 Updated!<br>";

// Task 4: Subquery / Relative Average Comparison
echo "<h3>Task 4: High Value Items</h3>";
$res4 = $conn->query("SELECT ItemName, Price, CASE WHEN Price > (SELECT AVG(Price) FROM items t2 WHERE t2.Category = items.Category) THEN 'Top Seller' ELSE 'Regular Seller' END AS Status FROM items");
while ($row = $res4->fetch_assoc()) {
    echo $row['ItemName'] . " - " . $row['Price'] . " - " . $row['Status'] . "<br>";
}

// Single Total (if asked)
$res5 = $conn->query("SELECT SUM(Price * Stock) AS NetWorth FROM items");
$row5 = $res5->fetch_assoc();
echo "<b>Total Net Worth: " . $row5['NetWorth'] . " BDT</b>";

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
