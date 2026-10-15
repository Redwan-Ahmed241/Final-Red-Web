// 2. Keep track of every reading entered so far (in arrays).
const heartRateReadings = [];
const spo2Readings = [];

// DOM Element references
const heartRateInput = document.getElementById("heartRateInput");
const spo2Input = document.getElementById("spo2Input");
const saveReadingBtn = document.getElementById("saveReadingBtn");
const reportLabel = document.getElementById("reportLabel");

// 3. Inside a function:
function processVitalsReading() {
    // 1. Take the user's Heart Rate and SpO2 from the input fields in the HTML file.
    const heartRate = parseFloat(heartRateInput.value.trim());
    const spo2 = parseFloat(spo2Input.value.trim());

    // Validation
    if (isNaN(heartRate) || isNaN(spo2) || heartRate <= 0 || spo2 <= 0 || spo2 > 100) {
        alert("Please enter valid positive numbers (SpO2 between 1 and 100).");
        return;
    }

    // Store reading in arrays
    heartRateReadings.push(heartRate);
    spo2Readings.push(spo2);

    // a) Calculate Average Heart Rate (of all readings entered so far, including the current one).
    const totalHeartRate = heartRateReadings.reduce((sum, val) => sum + val, 0);
    const avgHeartRate = totalHeartRate / heartRateReadings.length;

    // b) Calculate Average Oxygen Saturation (of all readings so far, including the current one).
    const totalSpO2 = spo2Readings.reduce((sum, val) => sum + val, 0);
    const avgSpO2 = totalSpO2 / spo2Readings.length;

    // c) Calculate the Risk Score from the current reading using the formula:
    // RiskScore = (100 − SpO2) × 2 + |HeartRate − 80| × 0.5
    const riskScore = (100 - spo2) * 2 + Math.abs(heartRate - 80) * 0.5;

    // d) Display the feedback in the label area:
    // “SAFE” if Risk Score <= 10
    // “WARNING” if Risk Score > 10 and <= 20
    // “DANGER” if Risk Score > 20
    let feedback = "";
    if (riskScore <= 10) {
        feedback = "SAFE";
    } else if (riskScore <= 20) {
        feedback = "WARNING";
    } else {
        feedback = "DANGER";
    }

    // Format output matching sample output
    const formattedAvgHR = Number.isInteger(avgHeartRate) ? avgHeartRate : parseFloat(avgHeartRate.toFixed(2));
    const formattedAvgSpO2 = Number.isInteger(avgSpO2) ? avgSpO2 : parseFloat(avgSpO2.toFixed(2));
    const formattedRisk = Number.isInteger(riskScore) ? riskScore : parseFloat(riskScore.toFixed(1));

    reportLabel.innerHTML = `Average Heart Rate: ${formattedAvgHR} | Average Oxygen Saturation: ${formattedAvgSpO2}% | Risk Score: ${formattedRisk} | Feedback: <b>${feedback}</b>`;

    // Clear inputs
    heartRateInput.value = "";
    spo2Input.value = "";
    heartRateInput.focus();
}

// Event listener
saveReadingBtn.addEventListener("click", processVitalsReading);
