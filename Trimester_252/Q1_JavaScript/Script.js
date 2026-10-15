// 1. Set a daily calorie goal of 2000 calories.
const DAILY_CALORIE_GOAL = 2000;

// Variables to keep track of running total and number of entries
let totalCalories = 0;
let entryCount = 0;

// Get DOM elements
const calorieInput = document.getElementById("calorieInput");
const addCaloriesBtn = document.getElementById("addCaloriesBtn");
const displayLabel = document.getElementById("displayLabel");

// 3. Inside a function:
function addCalories() {
    // 2. Take the user's calorie input from the HTML file.
    const enteredCalories = parseFloat(calorieInput.value);

    if (isNaN(enteredCalories) || enteredCalories <= 0) {
        alert("Please enter a valid number of calories.");
        return;
    }

    // d) Keep track of the number of entries the user has made
    entryCount++;

    // a) Add the entered calories to a running total.
    totalCalories += enteredCalories;

    // c) Display feedback messages based on progress:
    // • 0–800 → “You’re off to a healthy start!”
    // • 801–1600 → “Good progress, keep it balanced!”
    // • 1601–1999 → “Almost at your limit!”
    // • 2000+ → “Goal reached! Stay mindful!”
    let feedback = "";
    if (totalCalories <= 800) {
        feedback = "You’re off to a healthy start!";
    } else if (totalCalories <= 1600) {
        feedback = "Good progress, keep it balanced!";
    } else if (totalCalories < 2000) {
        feedback = "Almost at your limit!";
    } else {
        feedback = "Goal reached! Stay mindful!";
    }

    // e) If the user logs calories more than 10 times without reaching the goal, display
    // “Be cautious of frequent snacking!”
    if (entryCount > 10 && totalCalories < DAILY_CALORIE_GOAL) {
        feedback += " Be cautious of frequent snacking!";
    }

    // Daily goal progress
    const progressPercent = Math.round((totalCalories / DAILY_CALORIE_GOAL) * 100);

    // b) Display the total calories consumed so far, daily goal progress, and feedback messages
    displayLabel.textContent = `Total Calories: ${totalCalories} kcal | Progress: ${progressPercent}% (${totalCalories}/${DAILY_CALORIE_GOAL}) | Feedback: ${feedback}`;

    // Clear input field
    calorieInput.value = "";
}

// Attach event listener to button
addCaloriesBtn.addEventListener("click", addCalories);
