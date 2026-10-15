# UIU CSE4165 / CSE465 Web Programming - Final Exam Format & Pattern Analysis

Comprehensive analysis of previous trimester exam papers: **Trimester 251**, **Trimester 252**, **Trimester 253**, and **Trimester 261 (Sets A & B)**.

---

## 1. Exam Blueprint & Structure

| Metric | Specification |
| :--- | :--- |
| **Total Marks** | **30 Marks** |
| **Duration** | **2 Hours** |
| **Total Questions** | **3 Questions** (Each carries exactly **10 Marks**) |
| **Question 1** | **JavaScript & DOM Programming** (State, event handling, feedback) |
| **Question 2** | **PHP Form Processing & Business Logic** (Calculation, ceiling math, tiered evaluation) |
| **Question 3** | **PHP & MySQL Database Integration** (CRUD, aggregation, updates, conditional logic) |

---

## 2. Recurring Patterns & Templates by Question

### Question 1: JavaScript & DOM (10 Marks)

#### The Blueprint:
1. **HTML Architecture (`index.html` or `Index.html`)**:
   - 1 or 2 `<input>` fields (`type="text"`, `type="number"`, or `type="password"`).
   - An action `<button>` (e.g. *"Check Strength"*, *"Add Calories"*, *"Add Study"*, *"Save Reading"*).
   - An output container (usually `<label id="...">` or `<div>`) placed directly below the button.
2. **JavaScript State & Logic (`script.js` or `Script.js`)**:
   - **Target Constant**: A benchmark constant (e.g., `const GOAL = 2000;`, `const TARGET = 100;`, `const WEEKLY_GOAL = 20;`).
   - **Running State Tracking**: Global/closure variables for running sum (`let total = 0;`), count of attempts/sessions/entries (`let count = 0;`), and optionally an array (`let history = [];`).
   - **Trigger Function**: Bound via `button.addEventListener("click", ...)` or `onclick`.
   - **4-Tier Feedback Ladder**: A chained `if...else if...else` structure classifying the current progress.
   - **The Repetition/Snacking Warning (Signature Exam Requirement)**:
     - *251*: If user makes `> 8` attempts without reaching "Strong", display *"Need practice!"*.
     - *252*: If user makes `> 10` entries without reaching 2000 kcal, display *"Be cautious of frequent snacking!"*.
     - *261 Set A*: If user enters `> 7` sessions without reaching 20 hours, display *"Increase your study time!"*.
     - *261 Set B*: Computes `RiskScore = (100 - SpO2) * 2 + |HR - 80| * 0.5` with SAFE / WARNING / DANGER.

#### Exam JS Solution Template:
```javascript
const GOAL = 2000; // Or 100, 20, etc.
let runningTotal = 0;
let entryCount = 0;
const historyArray = [];

const inputElement = document.getElementById("myInput");
const actionBtn = document.getElementById("myBtn");
const displayLabel = document.getElementById("myLabel");

function handleAction() {
    const value = parseFloat(inputElement.value);
    if (isNaN(value) || value <= 0) return;

    entryCount++;
    runningTotal += value;
    historyArray.push(value);

    // 4-Tier Feedback
    let feedback = "";
    if (runningTotal <= 800) feedback = "Tier 1 message";
    else if (runningTotal <= 1600) feedback = "Tier 2 message";
    else if (runningTotal < GOAL) feedback = "Tier 3 message";
    else feedback = "Tier 4 Goal Reached!";

    // Warning condition
    if (entryCount > 10 && runningTotal < GOAL) {
        feedback += " Warning message!";
    }

    displayLabel.textContent = `Total: ${runningTotal} | Feedback: ${feedback}`;
    inputElement.value = "";
}

actionBtn.addEventListener("click", handleAction);
```

---

### Question 2: PHP Form Processing & Business Logic (10 Marks)

#### The Blueprint:
1. **HTML Form (`index.html`)**:
   - `<form action="calculate.php" method="POST">` containing **exactly 3 input fields** (e.g. attendees, cost, capacity; or items/day, days, target; or distance, rate, capacity).
2. **PHP Calculation Engine (`calculate.php`)**:
   - Read and sanitize via `$_POST[...]` with `intval()` or `floatval()`.
   - **Ceiling Division**: Always uses `ceil($total / $capacity)` because venues, screens, or battery packs cannot be partially booked/carried.
   - **Empty / Remainder / Difference Calculation**: `($booked * $capacity) - $required` or `$actual - $target`.
   - **Waste / Financial Metric**: `empty_units * unit_rate`.
   - **Evaluation / Performance Categories (4 levels)**:
     - *Excellent* (>= 500 or >= 120 credits)
     - *Good* (300-499 or 90-119 credits)
     - *Average* (150-299 or 60-89 credits)
     - *Poor* (< 150 or < 60 credits)
     - Or *Efficient* (<= 10%), *Acceptable* (10%-25%), *Wasteful* (> 25%).
   - **Output Format**: Displays results in a clean HTML `<table>` matching the sample output.

#### Exam PHP Calculation Template:
```php
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $val1 = intval($_POST['input1']);
    $val2 = intval($_POST['input2']);
    $val3 = intval($_POST['input3']);

    // Core ceiling math
    $unitsNeeded = ceil($val1 / $val3);
    $totalCapacity = $unitsNeeded * $val3;
    $unused = $totalCapacity - $val1;
    $wastedCost = $unused * $val2;

    // Classification
    $status = "";
    if ($unused <= 10) $status = "Efficient";
    elseif ($unused <= 25) $status = "Acceptable";
    else $status = "Wasteful";

    echo "<table border='1'><tr>...</tr></table>";
}
?>
```

---

### Question 3: PHP & MySQL Database Integration (10 Marks)

#### The Blueprint:
The question presents a table with 4–6 rows of seed data, and asks for **full PHP code with MySQL queries** (not just raw SQL).

The 4 standard tasks in every single exam paper:

| Sub-task | Type | Description | Common Exam Example |
| :--- | :--- | :--- | :--- |
| **Task 1** | `SELECT ... GROUP BY` | Category summary or filtered ordered selection | `SELECT Category, COUNT(*) FROM ... GROUP BY Category` |
| **Task 2** | `UPDATE ... WHERE ... AND ...` | Conditional update based on two criteria | `UPDATE table SET Rating = 'C' WHERE Salary < 40000 AND Rating != 'D'` |
| **Task 3** | `UPDATE ... (Arithmetic + Cap)` | Percentage increase or bonus with maximum ceiling | `UPDATE table SET Salary = Salary + 5000 WHERE Salary > 50000 AND (Salary + 5000) <= 60000` |
| **Task 4** | Advanced `SELECT` | Aggregation with `HAVING`, `ORDER BY DESC`, or Subquery | `SELECT Region, SUM(...) FROM ... GROUP BY Region HAVING SUM(...) > 1000000 ORDER BY ... DESC` |

#### Exam PHP-MySQL Solution Template:
```php
<?php
$conn = new mysqli("localhost", "root", "", "database_name");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// 1. SELECT with GROUP BY
$res1 = $conn->query("SELECT Category, COUNT(*) AS Total FROM table_name GROUP BY Category");
while ($row = $res1->fetch_assoc()) {
    echo $row['Category'] . ": " . $row['Total'] . "<br>";
}

// 2. Conditional UPDATE
$conn->query("UPDATE table_name SET col1 = 'NewVal' WHERE col2 < 40000 AND col1 != 'D'");

// 3. Bonus/Increment with ceiling cap
$conn->query("UPDATE table_name SET Salary = Salary + 5000 WHERE Salary > 50000 AND (Salary + 5000) <= 60000");

// 4. Group by with HAVING & ORDER BY
$res4 = $conn->query("SELECT Region, SUM(Fee * Visitors) AS Revenue FROM table_name GROUP BY Region HAVING Revenue > 1000000 ORDER BY Revenue DESC");
while ($row = $res4->fetch_assoc()) {
    echo $row['Region'] . " - " . $row['Revenue'] . "<br>";
}

$conn->close();
?>
```

---

## 3. Directory Map of Solved Questions

```
Final Questions/
├── FORMAT_AND_PATTERN_ANALYSIS.md     <-- Exam Pattern & Blueprint Analysis
│
├── Trimester_251/
│   ├── Q1_JavaScript/                 <-- Password Strength Tester (Score, Tiers, 8 Attempts Limit)
│   ├── Q2_PHP/                        <-- UIU Tech Fest Venue Budget Calculator (ceil, empty seats, waste)
│   └── Q3_PHP_MySQL/                  <-- uiutech_final (employee_final table queries)
│
├── Trimester_252/
│   ├── Q1_JavaScript/                 <-- Daily Calorie Tracker (2000 goal, 10 entries snacking warning)
│   ├── Q2_PHP/                        <-- Movie Night Screen Rental (ceil, empty seats, waste money)
│   └── Q3_PHP_MySQL/                  <-- sundarban (sales_data table queries, Top Seller status)
│
├── Trimester_253/
│   ├── Q1_PHP/                        <-- Best 2 CT Marks + Midterm + Final Average & Pass/Fail (> 54)
│   ├── Q2_PHP/                        <-- Event Sales Tracker (Items * Days, 4 Tiers, Target comparison)
│   └── Q3_PHP_MySQL/                  <-- campus_library (book_loans table queries, Grace Period update)
│
├── Trimester_261_SetA/
│   ├── Q1_JavaScript/                 <-- Weekly Study Tracker (20h goal, subjects array, 7 sessions limit)
│   ├── Q2_PHP/                        <-- Student Graduation Credits (Course * Credits, 4 Tiers, Target diff)
│   └── Q3_PHP_MySQL/                  <-- tourism (tourist_spot table queries, Beach search, fee updates)
│
└── Trimester_261_SetB/
    ├── Q1_JavaScript/                 <-- Patient Vitals Report (Arrays for HR & SpO2, Risk formula, Safe/Warning/Danger)
    ├── Q2_PHP/                        <-- Mars Rover Battery (ceil modules, Efficient / Acceptable / Wasteful)
    └── Q3_PHP_MySQL/                  <-- uiu_bookshop (book_info table queries, Net worth, 10% discount)
```
