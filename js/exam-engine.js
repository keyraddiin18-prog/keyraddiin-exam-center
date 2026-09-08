// ==========================================
// KEYRADDIIN EXAM CENTER
// EXAM ENGINE
// ==========================================

let examData = null;
let questions = [];
let currentQuestion = 0;
let answers = {};
let timeRemaining = 0;
let timerInterval = null;
let examStartTime = null;
let examSubmitted = false;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initializeExam();
});


// ==========================================
// INITIALIZE EXAM
// ==========================================

async function initializeExam() {

    const studentData = getStudentData();

    if (!studentData) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("studentName").textContent =
        studentData.fullName;

    try {

        const examCode = studentData.examCode;

        // Security: only allow safe exam-code characters
        if (!/^[A-Z0-9-]+$/.test(examCode)) {
            throw new Error("INVALID_CODE");
        }

const examPath =
    `/EXAM/${examCode}/exam.js`;

        // Load exam JavaScript module
        const module = await import(
            `${examPath}?v=${Date.now()}`
        );

        examData = module.default || window.EXAM_DATA;

        if (!examData) {
            throw new Error("EXAM_DATA_NOT_FOUND");
        }

        // ------------------------------------------
        // Verify grade
        // ------------------------------------------

        if (
            examData.grade &&
            normalizeGrade(examData.grade) !==
            normalizeGrade(studentData.grade)
        ) {
            throw new Error("GRADE_MISMATCH");
        }

        // ------------------------------------------
        // Verify exam code
        // ------------------------------------------

        if (
            examData.examCode &&
            examData.examCode.toUpperCase() !== examCode
        ) {
            throw new Error("CODE_MISMATCH");
        }

        // ------------------------------------------
        // Load questions
        // ------------------------------------------

        questions = Array.isArray(examData.questions)
            ? examData.questions
            : [];

        if (questions.length === 0) {
            throw new Error("NO_QUESTIONS");
        }

        // ------------------------------------------
        // Exam information
        // ------------------------------------------

        displayExamInformation();

        // ------------------------------------------
        // Timer
        // ------------------------------------------

        const timerMinutes =
            Number(examData.timer) || 30;

        timeRemaining =
            timerMinutes * 60;

        examStartTime = Date.now();

        startTimer();

        // ------------------------------------------
        // Question navigation
        // ------------------------------------------

        createQuestionNumbers();

        showQuestion(0);

        setupControls();

    } catch (error) {

        console.error("Exam loading error:", error);

        showExamError(error.message);
    }
}


// ==========================================
// GET STUDENT DATA
// ==========================================

function getStudentData() {

    try {

        const savedData =
            sessionStorage.getItem(
                "keyraddiin_student"
            );

        if (!savedData) {
            return null;
        }

        return JSON.parse(savedData);

    } catch (error) {

        console.error(error);

        return null;
    }
}


// ==========================================
// NORMALIZE GRADE
// ==========================================

function normalizeGrade(grade) {

    return String(grade)
        .toLowerCase()
        .replace(/\s+/g, "");
}


// ==========================================
// DISPLAY EXAM INFORMATION
// ==========================================

function displayExamInformation() {

    const title =
        examData.title ||
        `${examData.subject || "Exam"} Examination`;

    const subject =
        examData.subject || "";

    const unit =
        examData.unit || "";

    const code =
        examData.examCode || "";

    const details = [
        subject,
        unit,
        code
    ]
        .filter(Boolean)
        .join(" • ");

    document.getElementById(
        "examTitle"
    ).textContent = title;

    document.getElementById(
        "examDetails"
    ).textContent =
        `${details} • ${questions.length} Questions`;
}


// ==========================================
// CREATE QUESTION NUMBERS
// ==========================================

function createQuestionNumbers() {

    const container =
        document.getElementById(
            "questionNumbers"
        );

    container.innerHTML = "";

    questions.forEach((question, index) => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "question-number";

        button.textContent =
            index + 1;

        button.addEventListener(
            "click",
            () => {
                showQuestion(index);
            }
        );

        container.appendChild(button);
    });

    updateQuestionNumbers();
}


// ==========================================
// SHOW QUESTION
// ==========================================

function showQuestion(index) {

    if (
        index < 0 ||
        index >= questions.length
    ) {
        return;
    }

    currentQuestion = index;

    const question =
        questions[index];

    // ------------------------------------------
    // Question number
    // ------------------------------------------

    document.getElementById(
        "currentQuestionNumber"
    ).textContent =
        index + 1;


    // ------------------------------------------
    // Progress
    // ------------------------------------------

    document.getElementById(
        "questionProgress"
    ).textContent =
        `${index + 1} / ${questions.length}`;


    // ------------------------------------------
    // Question text
    // ------------------------------------------

    document.getElementById(
        "questionText"
    ).textContent =
        question.question ||
        question.text ||
        "";


    // ------------------------------------------
    // Options
    // ------------------------------------------

    renderOptions(question);


    // ------------------------------------------
    // Navigation buttons
    // ------------------------------------------

    updateNavigationButtons();

    updateQuestionNumbers();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// RENDER MCQ OPTIONS
// ==========================================

function renderOptions(question) {

    const container =
        document.getElementById(
            "optionsContainer"
        );

    container.innerHTML = "";

    const options =
        question.options || [];

    options.forEach((option, index) => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "option";

        const letter =
            String.fromCharCode(
                65 + index
            );

        const letterElement =
            document.createElement("span");

        letterElement.className =
            "option-letter";

        letterElement.textContent =
            letter;


        const textElement =
            document.createElement("span");

        textElement.textContent =
            option;


        button.appendChild(
            letterElement
        );

        button.appendChild(
            textElement
        );


        // Selected answer

        if (
            answers[currentQuestion] ===
            index
        ) {
            button.classList.add(
                "selected"
            );
        }


        // Select answer

        button.addEventListener(
            "click",
            () => {

                answers[currentQuestion] =
                    index;

                renderOptions(question);

                updateQuestionNumbers();
            }
        );


        container.appendChild(button);
    });
}


// ==========================================
// UPDATE QUESTION NUMBERS
// ==========================================

function updateQuestionNumbers() {

    const buttons =
        document.querySelectorAll(
            ".question-number"
        );

    buttons.forEach(
        (button, index) => {

            button.classList.remove(
                "active"
            );

            button.classList.remove(
                "answered"
            );

            if (
                index === currentQuestion
            ) {
                button.classList.add(
                    "active"
                );
            }

            if (
                answers[index] !== undefined
            ) {
                button.classList.add(
                    "answered"
                );
            }
        }
    );
}


// ==========================================
// NAVIGATION BUTTONS
// ==========================================

function updateNavigationButtons() {

    const previousButton =
        document.getElementById(
            "previousButton"
        );

    const nextButton =
        document.getElementById(
            "nextButton"
        );

    previousButton.disabled =
        currentQuestion === 0;

    if (
        currentQuestion ===
        questions.length - 1
    ) {

        nextButton.textContent =
            "Last Question ✓";

    } else {

        nextButton.textContent =
            "Next →";
    }
}


// ==========================================
// SETUP CONTROLS
// ==========================================

function setupControls() {

    const previousButton =
        document.getElementById(
            "previousButton"
        );

    const nextButton =
        document.getElementById(
            "nextButton"
        );

    const submitButton =
        document.getElementById(
            "submitButton"
        );

    const cancelSubmit =
        document.getElementById(
            "cancelSubmit"
        );

    const confirmSubmit =
        document.getElementById(
            "confirmSubmit"
        );


    // Previous

    previousButton.addEventListener(
        "click",
        () => {

            if (currentQuestion > 0) {
                showQuestion(
                    currentQuestion - 1
                );
            }
        }
    );


    // Next

    nextButton.addEventListener(
        "click",
        () => {

            if (
                currentQuestion <
                questions.length - 1
            ) {

                showQuestion(
                    currentQuestion + 1
                );

            } else {

                openSubmitModal();
            }
        }
    );


    // Submit

    submitButton.addEventListener(
        "click",
        () => {
            openSubmitModal();
        }
    );


    // Cancel

    cancelSubmit.addEventListener(
        "click",
        () => {
            closeSubmitModal();
        }
    );


    // Confirm

    confirmSubmit.addEventListener(
        "click",
        () => {
            submitExam();
        }
    );
}


// ==========================================
// TIMER
// ==========================================

function startTimer() {

    updateTimerDisplay();

    timerInterval =
        setInterval(() => {

            if (examSubmitted) {
                return;
            }

            timeRemaining--;

            updateTimerDisplay();

            if (timeRemaining <= 0) {

                clearInterval(
                    timerInterval
                );

                autoSubmitExam();
            }

        }, 1000);
}


// ==========================================
// TIMER DISPLAY
// ==========================================

function updateTimerDisplay() {

    const timer =
        document.getElementById(
            "timer"
        );

    if (!timer) return;

    const minutes =
        Math.floor(
            timeRemaining / 60
        );

    const seconds =
        timeRemaining % 60;

    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// ==========================================
// OPEN SUBMIT MODAL
// ==========================================

function openSubmitModal() {

    const modal =
        document.getElementById(
            "submitModal"
        );

    const answered =
        Object.keys(answers).length;

    const unanswered =
        questions.length - answered;

    const message =
        document.getElementById(
            "submitMessage"
        );

    if (unanswered > 0) {

        message.textContent =
            `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`;

    } else {

        message.textContent =
            "You have answered all questions. Are you ready to submit your examination?";
    }

    modal.classList.remove(
        "hidden"
    );
}


// ==========================================
// CLOSE SUBMIT MODAL
// ==========================================

function closeSubmitModal() {

    const modal =
        document.getElementById(
            "submitModal"
        );

    modal.classList.add(
        "hidden"
    );
}


// ==========================================
// AUTO SUBMIT
// ==========================================

function autoSubmitExam() {

    if (examSubmitted) {
        return;
    }

    alert(
        "Time is over. Your examination will be submitted automatically."
    );

    submitExam();
}


// ==========================================
// SUBMIT EXAM
// ==========================================

function submitExam() {

    console.log("SUBMIT BUTTON CONFIRMED");

    if (examSubmitted) {
        return;
    }

    examSubmitted = true;

    clearInterval(
        timerInterval
    );


    // ------------------------------------------
    // Calculate score
    // ------------------------------------------

    let correct = 0;

    let wrong = 0;

    questions.forEach(
        (question, index) => {

            if (
                answers[index] !== undefined
            ) {

                const selectedIndex =
                    answers[index];

                const correctAnswer =
                    getCorrectAnswerIndex(
                        question
                    );

                if (
                    selectedIndex ===
                    correctAnswer
                ) {

                    correct++;

                } else {

                    wrong++;
                }

            } else {

                wrong++;
            }
        }
    );


    const total =
        questions.length;

    const percentage =
        total > 0
            ? Math.round(
                (correct / total) * 100
            )
            : 0;


    // ------------------------------------------
    // Pass mark
    // ------------------------------------------

    const passMark =
        Number(
            examData.passMark
        ) || 50;

    const passed =
        percentage >= passMark;


    // ------------------------------------------
    // Time used
    // ------------------------------------------

    const totalSeconds =
        (Number(examData.timer) || 30) * 60;

    const usedSeconds =
        Math.max(
            0,
            totalSeconds - timeRemaining
        );


    const timeUsed =
        formatTime(
            usedSeconds
        );


    // ------------------------------------------
    // Save result
    // ------------------------------------------

    const studentData =
        getStudentData();


    const resultData = {

        studentName:
            studentData?.fullName || "",

        grade:
            studentData?.grade || "",

        examCode:
            studentData?.examCode || "",

        examTitle:
            examData.title || "",

        subject:
            examData.subject || "",

        unit:
            examData.unit || "",

        score: correct,

        total: total,

        percentage: percentage,

        correct: correct,

        wrong: wrong,

        timeUsed: timeUsed,

        status:
            passed
                ? "PASSED"
                : "FAILED",

        passMark: passMark,

        submittedAt:
            new Date().toISOString()
    };


    sessionStorage.setItem(
        "keyraddiin_result",
        JSON.stringify(resultData)
    );


    // ------------------------------------------
    // Go to result page
    // ------------------------------------------

    window.location.href =
        "result.html";
}


// ==========================================
// GET CORRECT ANSWER
// ==========================================

function getCorrectAnswerIndex(question) {

    // Preferred format:
    // correctAnswer: 2
    // where 0=A, 1=B, 2=C, 3=D

    if (
        typeof question.correctAnswer ===
        "number"
    ) {

        return question.correctAnswer;
    }


    // Alternative format:
    // answer: "C"

    if (
        typeof question.answer ===
        "string"
    ) {

        const answer =
            question.answer
                .trim()
                .toUpperCase();

        if (
            /^[A-D]$/.test(answer)
        ) {

            return (
                answer.charCodeAt(0) -
                65
            );
        }
    }


    return -1;
}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(totalSeconds) {

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const seconds =
        totalSeconds % 60;

    return (
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    );
}


// ==========================================
// EXAM ERROR
// ==========================================

function showExamError(errorType) {

    let message =
        "Unable to load this examination.";

    if (
        errorType === "INVALID_CODE"
    ) {

        message =
            "Invalid Exam Code.";

    } else if (
        errorType === "GRADE_MISMATCH"
    ) {

        message =
            "The selected Grade does not match this examination.";

    } else if (
        errorType === "CODE_MISMATCH"
    ) {

        message =
            "Exam Code verification failed.";

    } else if (
        errorType === "NO_QUESTIONS"
    ) {

        message =
            "This examination does not contain any questions.";

    } else if (
        errorType === "EXAM_DATA_NOT_FOUND"
    ) {

        message =
            "Exam data could not be loaded.";
    }


    document.body.innerHTML = `

        <main style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
            font-family:Arial,Helvetica,sans-serif;
            background:#f1f5f9;
        ">

            <section style="
                width:min(100%,500px);
                background:white;
                padding:35px;
                border-radius:18px;
                text-align:center;
                box-shadow:0 10px 30px rgba(15,23,42,.08);
            ">

                <div style="
                    font-size:45px;
                    margin-bottom:15px;
                ">
                    ⚠️
                </div>

                <h2 style="
                    margin-bottom:12px;
                    color:#0f172a;
                ">
                    Exam Unavailable
                </h2>

                <p style="
                    color:#64748b;
                    line-height:1.6;
                    margin-bottom:25px;
                ">
                    ${message}
                </p>

                <button
                    onclick="window.location.href='index.html'"
                    style="
                        border:none;
                        background:#2563eb;
                        color:white;
                        padding:13px 24px;
                        border-radius:9px;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    ← Back to Login
                </button>

            </section>

        </main>
    `;
}
