// 1. Generate a target strength score of 100 points for a "Very Strong" password.
const TARGET_STRENGTH_SCORE = 100;

// Keep track of how many attempts the user has made
let attemptCount = 0;

const passwordInput = document.getElementById("passwordInput");
const checkBtn = document.getElementById("checkBtn");
const resultLabel = document.getElementById("resultLabel");

// 3. Inside a function:
function checkPasswordStrength() {
    // 2. Take the user's password input from the HTML file
    const password = passwordInput.value;
    attemptCount++;

    let score = 0;

    // Criteria 1: Length: +10 points for every 2 characters (minimum 6 characters required)
    // Formula matching sample output: pairs above minimum 6 characters get 10 points each
    if (password.length >= 6) {
        score += Math.floor((password.length - 6) / 2) * 10;
    }

    // Criteria 2: Uppercase letters: +15 points if present
    if (/[A-Z]/.test(password)) {
        score += 15;
    }

    // Criteria 3: Lowercase letters: +15 points if present
    if (/[a-z]/.test(password)) {
        score += 15;
    }

    // Criteria 4: Numbers: +20 points if present
    if (/[0-9]/.test(password)) {
        score += 20;
    }

    // Criteria 5: Special characters (!@#$%^&*): +25 points if present
    if (/[!@#$%^&*]/.test(password)) {
        score += 25;
    }

    // Determine strength level:
    // "Very Weak" (0-30), "Weak" (31-50), "Medium" (51-70), "Strong" (71-90), "Very Strong" (91+)
    let level = "";
    if (score <= 30) {
        level = "Very Weak";
    } else if (score <= 50) {
        level = "Weak";
    } else if (score <= 70) {
        level = "Medium";
    } else if (score <= 90) {
        level = "Strong";
    } else {
        level = "Very Strong";
    }

    // If password reaches 100+ points, display "Perfect Password!" and show a success message
    let outputText = "";
    if (score >= 100) {
        outputText = `Score: ${score} - Perfect Password! Success! Your password is exceptionally secure.`;
    } else {
        outputText = `Score: ${score} - ${level}`;
    }

    // If the user makes more than 8 attempts without reaching "Strong" level, display
    // "Need practice!" and suggest password tips
    // Note: "Strong" level is 71-90, and above is "Very Strong" (91+)
    if (attemptCount > 8 && score < 71) {
        outputText += " | Need practice! Tips: Add uppercase letters, numbers, and special symbols (!@#$%^&*), and make it at least 8+ characters long.";
    }

    // Display result in label field
    resultLabel.textContent = outputText;
}

// Event listener for button click
checkBtn.addEventListener("click", checkPasswordStrength);
