// ==========================================
// KEYRADDIIN EXAM CENTER
// Login / Exam Code Handler
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    if (!form) {
        console.error("Login form not found.");
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        // ------------------------------------------
        // Get form values
        // ------------------------------------------

        const fullNameInput = document.getElementById("fullName");
        const gradeInput = document.getElementById("grade");
        const examCodeInput = document.getElementById("examCode");
        const errorMessage = document.getElementById("errorMessage");
        const startButton = form.querySelector("button[type='submit']");

        const fullName = fullNameInput.value.trim();
        const grade = gradeInput.value.trim();
        const examCode = examCodeInput.value.trim().toUpperCase();

        // ------------------------------------------
        // Clear previous error
        // ------------------------------------------

        errorMessage.textContent = "";
        errorMessage.classList.remove("show");

        // ------------------------------------------
        // Basic validation
        // ------------------------------------------

        if (!fullName) {
            showError("Please enter your full name.");
            fullNameInput.focus();
            return;
        }

        if (fullName.length < 2) {
            showError("Please enter a valid full name.");
            fullNameInput.focus();
            return;
        }

        if (!grade) {
            showError("Please select your grade.");
            gradeInput.focus();
            return;
        }

        if (!examCode) {
            showError("Please enter the Exam Code.");
            examCodeInput.focus();
            return;
        }

        // ------------------------------------------
        // Exam Code security validation
        // ------------------------------------------

        const validCodeFormat = /^[A-Z0-9-]+$/;

        if (!validCodeFormat.test(examCode)) {
            showError("Invalid Exam Code format.");
            examCodeInput.focus();
            return;
        }

        // ------------------------------------------
        // Disable button while checking
        // ------------------------------------------

        startButton.disabled = true;
        startButton.innerHTML = "CHECKING...";

        try {

            // ------------------------------------------
            // Exam folder path
            // Example:
            // EXAM/G9-BIO-U1-2026/exam.js
            // ------------------------------------------

            const examPath =
                `./EXAM/${examCode}/exam.js`;

            // ------------------------------------------
            // Check whether exam.js exists
            // ------------------------------------------

            const response = await fetch(examPath, {
                method: "HEAD",
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("EXAM_NOT_FOUND");
            }

            // ------------------------------------------
            // Save student information
            // ------------------------------------------

            const studentData = {
                fullName: fullName,
                grade: grade,
                examCode: examCode,
                startTime: Date.now()
            };

            sessionStorage.setItem(
                "keyraddiin_student",
                JSON.stringify(studentData)
            );

            // ------------------------------------------
            // Go to examination page
            // ------------------------------------------

            window.location.href = "exam.html";

        } catch (error) {

            console.error(error);

            if (error.message === "EXAM_NOT_FOUND") {

                showError(
                    "Exam not found. Please check the Exam Code provided by your teacher."
                );

            } else {

                showError(
                    "Unable to connect to the examination system. Please check your internet connection."
                );
            }

            startButton.disabled = false;
            startButton.innerHTML = "START EXAM →";
        }
    });


    // ==========================================
    // Show Error Message
    // ==========================================

    function showError(message) {

        const errorMessage =
            document.getElementById("errorMessage");

        if (!errorMessage) return;

        errorMessage.textContent = message;
        errorMessage.classList.add("show");
    }

});
