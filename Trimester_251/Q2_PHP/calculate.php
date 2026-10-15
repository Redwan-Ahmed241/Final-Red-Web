<?php
// Function to calculate venue booking requirements and budget
function calculateVenueBudget($attendees, $costPerPerson, $venueCapacity) {
    // Calculate minimum number of complete venues needed (cannot book partial venues)
    $totalVenues = ceil($attendees / $venueCapacity);

    // Calculate total capacity of booked venues
    $totalCapacity = $totalVenues * $venueCapacity;

    // Calculate empty seats remaining
    $emptySeats = $totalCapacity - $attendees;

    // Calculate wasted money on empty seats based on cost per person (as shown in exam sample output)
    $wastedMoney = $emptySeats * $costPerPerson;

    // Fixed venue cost note: 15,000 BDT per venue
    $totalVenueRentalCost = $totalVenues * 15000;

    return [
        'totalVenues' => $totalVenues,
        'emptySeats' => $emptySeats,
        'wastedMoney' => $wastedMoney,
        'totalVenueRentalCost' => $totalVenueRentalCost
    ];
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $attendees = intval($_POST['attendees']);
    $costPerPerson = intval($_POST['cost_per_person']);
    $venueCapacity = intval($_POST['venue_capacity']);

    $result = calculateVenueBudget($attendees, $costPerPerson, $venueCapacity);

    echo "<h2>Venue Booking Calculation Result</h2>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr>
            <th>Attendees</th>
            <th>Cost per Person</th>
            <th>Venue Capacity</th>
            <th>Total Venues</th>
            <th>Empty Seats</th>
            <th>Wasted Money (BDT)</th>
          </tr>";
    echo "<tr>
            <td>{$attendees}</td>
            <td>{$costPerPerson}</td>
            <td>{$venueCapacity}</td>
            <td>{$result['totalVenues']}</td>
            <td>{$result['emptySeats']}</td>
            <td>" . number_format($result['wastedMoney']) . "</td>
          </tr>";
    echo "</table>";
    echo "<br><a href='index.html'>Back to Calculator</a>";
}
?>
