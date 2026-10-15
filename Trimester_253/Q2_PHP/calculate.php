<?php
function evaluateSales($itemsPerDay, $days, $target) {
    // 1. Calculate total items sold
    $totalItems = $itemsPerDay * $days;

    // 2. Classify performance:
    // ● Excellent: total items sold 500 or more
    // ● Good: total items sold 300 or more but less than 500
    // ● Average: total items sold 150 or more but less than 300
    // ● Poor: total items sold less than 150
    $performance = "";
    if ($totalItems >= 500) {
        $performance = "Excellent";
    } elseif ($totalItems >= 300) {
        $performance = "Good";
    } elseif ($totalItems >= 150) {
        $performance = "Average";
    } else {
        $performance = "Poor";
    }

    // 3. Compare total items sold with target
    $result = "";
    if ($totalItems == $target) {
        $result = "Target met exactly (0 difference)";
    } elseif ($totalItems > $target) {
        $difference = $totalItems - $target;
        $result = "Above target by " . $difference;
    } else {
        $difference = $target - $totalItems;
        $result = "Below target by " . $difference;
    }

    return [
        'totalItems' => $totalItems,
        'performance' => $performance,
        'result' => $result
    ];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $itemsPerDay = intval($_POST['items_per_day']);
    $days = intval($_POST['days']);
    $target = intval($_POST['target']);

    $res = evaluateSales($itemsPerDay, $days, $target);

    echo "<h2>Sales Performance Result</h2>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr>
            <th>Items Sold / Day</th>
            <th>Number of Days</th>
            <th>Target</th>
            <th>Total Items Sold</th>
            <th>Performance</th>
            <th>Result</th>
          </tr>";
    echo "<tr>
            <td>{$itemsPerDay}</td>
            <td>{$days}</td>
            <td>{$target}</td>
            <td>{$res['totalItems']}</td>
            <td>{$res['performance']}</td>
            <td>{$res['result']}</td>
          </tr>";
    echo "</table>";
    echo "<br><a href='index.html'>Back</a>";
}
?>
