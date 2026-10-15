<?php
function evaluateAcademicProgress($creditsPerCourse, $coursesCompleted, $targetCredits) {
    // 1. Calculate total credits earned
    $totalCredits = $creditsPerCourse * $coursesCompleted;

    // 2. Classify academic progress:
    // ● Excellent: total credits 120 or more
    // ● Good: total credits 90 or more but less than 120
    // ● Average: total credits 60 or more but less than 90
    // ● Poor: total credits less than 60
    $progress = "";
    if ($totalCredits >= 120) {
        $progress = "Excellent";
    } elseif ($totalCredits >= 90) {
        $progress = "Good";
    } elseif ($totalCredits >= 60) {
        $progress = "Average";
    } else {
        $progress = "Poor";
    }

    // 3. Compare with target graduation credits
    $result = "";
    if ($totalCredits == $targetCredits) {
        $result = "Target met exactly (0 difference)";
    } elseif ($totalCredits > $targetCredits) {
        $diff = $totalCredits - $targetCredits;
        $result = "Above target by " . $diff;
    } else {
        $diff = $targetCredits - $totalCredits;
        $result = "Below target by " . $diff;
    }

    return [
        'totalCredits' => $totalCredits,
        'progress' => $progress,
        'result' => $result
    ];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $creditsPerCourse = intval($_POST['credits_per_course']);
    $coursesCompleted = intval($_POST['courses_completed']);
    $targetCredits = intval($_POST['target_credits']);

    $res = evaluateAcademicProgress($creditsPerCourse, $coursesCompleted, $targetCredits);

    echo "<h2>Student Academic Progress Report</h2>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr>
            <th>Credits / Course</th>
            <th>Courses Completed</th>
            <th>Target</th>
            <th>Total Credits</th>
            <th>Progress</th>
            <th>Result</th>
          </tr>";
    echo "<tr>
            <td>{$creditsPerCourse}</td>
            <td>{$coursesCompleted}</td>
            <td>{$targetCredits}</td>
            <td>{$res['totalCredits']}</td>
            <td>{$res['progress']}</td>
            <td>{$res['result']}</td>
          </tr>";
    echo "</table>";
    echo "<br><a href='index.html'>Back</a>";
}
?>
