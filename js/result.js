// ==========================================
// KEYRADDIIN EXAM CENTER
// RESULT ENGINE
// ==========================================


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadResult();

        setupButtons();

    }
);


// ==========================================
// LOAD RESULT
// ==========================================

function loadResult() {

    const storedResult =
        sessionStorage.getItem(
            "keyraddiin_result"
        );


    // ------------------------------------------
    // No result found
    // ------------------------------------------

    if (!storedResult) {

        showNoResult();

        return;
    }


    let result;

    try {

        result =
            JSON.parse(
                storedResult
            );

    } catch (error) {

        console.error(
            "Invalid result data:",
            error
        );

        showNoResult();

        return;
    }


    // ------------------------------------------
    // Student
    // ------------------------------------------

    setText(
        "studentName",
        result.studentName || "—"
    );


    setText(
        "studentGrade",
        result.grade || "—"
    );


    // ------------------------------------------
    // Exam
    // ------------------------------------------

    setText(
        "examTitle",
        result.examTitle || "Examination"
    );


    const examDetails = [

        result.subject,

        result.unit

    ]
        .filter(Boolean)
        .join(" • ");


    setText(
        "examDetails",
        examDetails || "—"
    );


    setText(
        "examCode",
        result.examCode || "—"
    );


    // ------------------------------------------
    // Score
    // ------------------------------------------

    setText(
        "score",
        result.score ?? 0
    );


    setText(
        "total",
        `/ ${result.total ?? 0}`
    );


    // ------------------------------------------
    // Statistics
    // ------------------------------------------

    setText(
        "correct",
        result.correct ?? 0
    );


    setText(
        "wrong",
        result.wrong ?? 0
    );


    const percentage =
        Number(
            result.percentage
        ) || 0;


    setText(
        "percentage",
        `${percentage}%`
    );


    setText(
        "percentageStat",
        `${percentage}%`
    );


    setText(
        "timeUsed",
        result.timeUsed || "00:00"
    );


    // ------------------------------------------
    // Pass Mark
    // ------------------------------------------

    const passMark =
        Number(
            result.passMark
        ) || 50;


    setText(
        "passMark",
        `${passMark}%`
    );


    // ------------------------------------------
    // Status
    // ------------------------------------------

    const passed =
        result.status === "PASSED";


    const statusText =
        passed
            ? "PASSED"
            : "FAILED";


    setText(
        "status",
        statusText
    );


    setText(
        "statusText",
        statusText
    );


    const statusElement =
        document.getElementById(
            "status"
        );


    if (statusElement) {

        statusElement.classList.remove(
            "passed",
            "failed"
        );


        statusElement.classList.add(
            passed
                ? "passed"
                : "failed"
        );

    }


    // ------------------------------------------
    // Telegram button
    // ------------------------------------------

    setupTelegramButton(
        result
    );
}


// ==========================================
// SET TEXT SAFELY
// ==========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        String(value);

}


// ==========================================
// NO RESULT
// ==========================================

function showNoResult() {

    const container =
        document.querySelector(
            ".result-card"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="result-icon">

            <div class="icon-circle">
                !
            </div>

        </div>

        <h2>
            No Result Found
        </h2>

        <p class="result-subtitle">
            We could not find a completed examination result.
        </p>

        <div class="result-actions">

            <button
                type="button"
                class="primary-button"
                onclick="goHome()"
            >
                ← BACK TO HOME
            </button>

        </div>

    `;
}


// ==========================================
// BUTTONS
// ==========================================

function setupButtons() {

    const retakeButton =
        document.getElementById(
            "retakeButton"
        );


    const homeButton =
        document.getElementById(
            "homeButton"
        );


    // ------------------------------------------
    // Retake
    // ------------------------------------------

    if (retakeButton) {

        retakeButton.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "keyraddiin_result"
                );

                window.location.href =
                    "exam.html";

            }
        );

    }


    // ------------------------------------------
    // Home
    // ------------------------------------------

    if (homeButton) {

        homeButton.addEventListener(
            "click",
            () => {

                goHome();

            }
        );

    }

}


// ==========================================
// HOME
// ==========================================

function goHome() {

    sessionStorage.removeItem(
        "keyraddiin_result"
    );

    sessionStorage.removeItem(
        "keyraddiin_student"
    );


    window.location.href =
        "index.html";
}


// ==========================================
// TELEGRAM BUTTON
// ==========================================

function setupTelegramButton(
    result
) {

    const button =
        document.getElementById(
            "telegramButton"
        );


    const message =
        document.getElementById(
            "telegramMessage"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            button.disabled =
                true;


            if (message) {

                message.textContent =
                    "Sending result...";

            }


            try {

                const response =
                    await fetch(
                        "/api/send-result",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    result
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to send result."
                    );

                }


                if (message) {

                    message.textContent =
                        "✓ Result sent successfully to Telegram.";

                }


            } catch (error) {

                console.error(
                    "Telegram error:",
                    error
                );


                if (message) {

                    message.textContent =
                        "⚠️ Telegram service is not available yet. Please try again later.";

                }

            } finally {

                button.disabled =
                    false;

            }

        }
    );

}
