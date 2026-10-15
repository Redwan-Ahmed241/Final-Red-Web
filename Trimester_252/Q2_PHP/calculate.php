<?php
// Function to calculate screen booking and wasted money
function calculateMovieNight($attendees, $seatCapacity, $ticketPrice) {
    // 1. Calculate complete screens needed
    $totalScreens = ceil($attendees / $seatCapacity);

    // 2. Calculate empty seats remaining
    $totalSeats = $totalScreens * $seatCapacity;
    $emptySeats = $totalSeats - $attendees;

    // 3. Calculate wasted money on empty seats (based on ticket price)
    $wastedMoney = $emptySeats * $ticketPrice;

    // Fixed rental cost per screen is 25,000 BDT
    $rentalCost = $totalScreens * 25000;

    return [
        'totalScreens' => $totalScreens,
        'emptySeats' => $emptySeats,
        'wastedMoney' => $wastedMoney,
        'rentalCost' => $rentalCost
    ];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $attendees = intval($_POST['attendees']);
    $seatCapacity = intval($_POST['capacity']);
    $ticketPrice = intval($_POST['ticket_price']);

    $result = calculateMovieNight($attendees, $seatCapacity, $ticketPrice);

    echo "<h2>Movie Night Calculation Result</h2>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr>
            <th>Attendees</th>
            <th>Seat Capacity</th>
            <th>Ticket Price</th>
            <th>Total Screens</th>
            <th>Empty Seats</th>
            <th>Wasted Money (BDT)</th>
          </tr>";
    echo "<tr>
            <td>{$attendees}</td>
            <td>{$seatCapacity}</td>
            <td>{$ticketPrice}</td>
            <td>{$result['totalScreens']}</td>
            <td>{$result['emptySeats']}</td>
            <td>" . number_format($result['wastedMoney']) . "</td>
          </tr>";
    echo "</table>";
    echo "<br><a href='index.html'>Back</a>";
}
?>
