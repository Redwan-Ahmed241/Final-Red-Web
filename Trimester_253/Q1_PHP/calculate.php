<?php
function processStudentMarks($ct1, $ct2, $ct3, $midterm, $final) {
    // Put CT marks in an array and sort descending
    $cts = [$ct1, $ct2, $ct3];
    rsort($cts);

    // Best two CTs are the first two elements
    $best1 = $cts[0];
    $best2 = $cts[1];
    $ctAverage = ($best1 + $best2) / 2.0;

    // Total marks = CT average + Midterm + Final
    $totalMarks = $ctAverage + $midterm + $final;

    // Status: 'Passed' if total marks > 54, otherwise 'Failed'
    $status = ($totalMarks > 54) ? "Passed" : "Failed";

    return [
        'best1' => $best1,
        'best2' => $best2,
        'ctAverage' => $ctAverage,
        'totalMarks' => $totalMarks,
        'status' => $status
    ];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $ct1 = floatval($_POST['ct1']);
    $ct2 = floatval($_POST['ct2']);
    $ct3 = floatval($_POST['ct3']);
    $midterm = floatval($_POST['midterm']);
    $final = floatval($_POST['final']);

    $result = processStudentMarks($ct1, $ct2, $ct3, $midterm, $final);

    echo "<h2>Student Academic Result</h2>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr><th>CT 1</th><td>{$ct1}</td></tr>";
    echo "<tr><th>CT 2</th><td>{$ct2}</td></tr>";
    echo "<tr><th>CT 3</th><td>{$ct3}</td></tr>";
    echo "<tr><th>Best 2 CTs</th><td>{$result['best1']}, {$result['best2']}</td></tr>";
    echo "<tr><th>CT Average</th><td>" . number_format($result['ctAverage'], 2) . "</td></tr>";
    echo "<tr><th>Midterm Mark</th><td>{$midterm}</td></tr>";
    echo "<tr><th>Final Exam Mark</th><td>{$final}</td></tr>";
    echo "<tr><th>Total Marks</th><td>" . number_format($result['totalMarks'], 2) . "</td></tr>";
    echo "<tr><th>Status</th><td><b>{$result['status']}</b></td></tr>";
    echo "</table>";
    echo "<br><a href='index.html'>Back</a>";
}
?>
