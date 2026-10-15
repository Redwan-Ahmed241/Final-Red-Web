<?php
function calculateRoverBattery($distance, $energyPerMeter, $batteryCapacity) {
    // 1. Total energy required = mission distance * energy consumption per meter
    $totalEnergyRequired = $distance * $energyPerMeter;

    // 2. Minimum number of complete battery modules needed (cannot carry partial modules)
    $batteryModules = ceil($totalEnergyRequired / $batteryCapacity);

    // 3. Total carried energy and unused energy capacity
    $totalCarriedEnergy = $batteryModules * $batteryCapacity;
    $unusedEnergy = $totalCarriedEnergy - $totalEnergyRequired;

    // 4. Classify battery usage efficiency:
    // ● Efficient: unused energy <= 10% of total carried energy
    // ● Acceptable: unused energy > 10% but <= 25% of total carried energy
    // ● Wasteful: unused energy > 25% of total carried energy
    $percentageUnused = ($unusedEnergy / $totalCarriedEnergy) * 100;

    $status = "";
    if ($percentageUnused <= 10) {
        $status = "Efficient";
    } elseif ($percentageUnused <= 25) {
        $status = "Acceptable";
    } else {
        $status = "Wasteful";
    }

    return [
        'totalEnergyRequired' => $totalEnergyRequired,
        'batteryModules' => $batteryModules,
        'unusedEnergy' => $unusedEnergy,
        'status' => $status
    ];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $distance = floatval($_POST['distance']);
    $energyPerMeter = floatval($_POST['energy_per_meter']);
    $batteryCapacity = floatval($_POST['battery_capacity']);

    $res = calculateRoverBattery($distance, $energyPerMeter, $batteryCapacity);

    echo "<h2>Mars Rover Battery Calculation Result</h2>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr>
            <th>Mission Distance</th>
            <th>Energy per Meter</th>
            <th>Battery Capacity</th>
            <th>Total Energy Required</th>
            <th>Battery Modules</th>
            <th>Unused Energy</th>
            <th>Status</th>
          </tr>";
    echo "<tr>
            <td>{$distance}</td>
            <td>{$energyPerMeter}</td>
            <td>{$batteryCapacity}</td>
            <td>{$res['totalEnergyRequired']}</td>
            <td>{$res['batteryModules']}</td>
            <td>{$res['unusedEnergy']}</td>
            <td><b>{$res['status']}</b></td>
          </tr>";
    echo "</table>";
    echo "<br><a href='index.html'>Back</a>";
}
?>
