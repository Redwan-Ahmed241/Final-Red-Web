// a. Set a weekly study goal of 20 hours.
const WEEKLY_GOAL = 20;

// Running variables
let totalStudyHours = 0;
let sessionCount = 0;
const subjectsStudied = [];

// DOM Elements
const subjectInput = document.getElementById("subjectInput");
const hoursInput = document.getElementById("hoursInput");
const addStudyBtn = document.getElementById("addStudyBtn");
const displayArea = document.getElementById("displayArea");

function addStudy() {
    const subject = subjectInput.value.trim();
    const hours = parseFloat(hoursInput.value);

    // Validation
    if (!subject || isNaN(hours) || hours <= 0) {
        alert("Please enter a valid subject name and positive study hours.");
        return;
    }

    // b. Add the entered study hours to a running total.
    totalStudyHours += hours;

    // c. Store each entered subject name.
    subjectsStudied.push(subject);

    // d. Count how many study sessions the user has entered.
    sessionCount++;

    // e. Calculate the average study hour so far:
    // Average = Total Study Hours / Number of Sessions
    const average = totalStudyHours / sessionCount;

    // g. Display feedback based on total study hours:
    // 0–5 → “Start studying regularly!”
    // 6–12 → “Good progress!”
    // 13–19 → “Almost ready!”
    // 20+ → “Weekly goal reached!”
    let feedback = "";
    if (totalStudyHours <= 5) {
        feedback = "Start studying regularly!";
    } else if (totalStudyHours <= 12) {
        feedback = "Good progress!";
    } else if (totalStudyHours <= 19) {
        feedback = "Almost ready!";
    } else {
        feedback = "Weekly goal reached!";
    }

    // h. If the user enters more than 7 study sessions without reaching 20 hours, display:
    // “Increase your study time!”
    if (sessionCount > 7 && totalStudyHours < WEEKLY_GOAL) {
        feedback = "Increase your study time!";
    }

    // Format subjects array as string: [English, English, Bangla, Physics]
    const subjectsStr = `[${subjectsStudied.join(", ")}]`;

    // f. Display: total study hours, average study hours, subjects studied, feedback message
    displayArea.textContent = `Total: ${totalStudyHours} hours, Average: ${parseFloat(average.toFixed(3))} hours, Subjects: ${subjectsStr}, ${feedback}`;

    // Clear inputs
    subjectInput.value = "";
    hoursInput.value = "";
}

// Event listener for button click
addStudyBtn.addEventListener("click", addStudy);
