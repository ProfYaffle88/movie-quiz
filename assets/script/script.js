/* Declare constants */
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const scoreContainer = document.getElementById('score-container');

const questionCount = document.getElementById('question-counter');
const questionTimer = document.getElementById('timer');

const submitScoreButton = document.getElementById('submit-score-btn');
const tryAgainButton = document.getElementById('try-again-btn');

let timer, timeLeft, score, currentQuestionIndex, questionsList, answered;

/* Event Listeners */
startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', () => {
    setNextQuestion();
});

/* Start Game function */
function startGame() {
    score = 0;
    startButton.classList.add('hide');
    questionContainerElement.classList.remove('hide');
    scoreContainer.classList.remove('hide');
    questionCount.classList.remove('hide');
    questionTimer.classList.remove('hide');
    
    
    getQuestions();

    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 60; // Set the initial time (in seconds)
    updateCounter();
    updateTimer();
    timer = setInterval(updateTimer, 1000); // Update timer every second
}

/* Retrieve set of 12 Film/TV questions from API */
function getQuestions() {
    let apiUrl = 'https://the-trivia-api.com/v2/questions?limit=12&categories=film_and_tv&region=GB';
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        questionsList = data;
        setNextQuestion();
    });
}

function updateCounter() {
    const counterElement = document.getElementById('question-counter');
    counterElement.innerText = `Question ${currentQuestionIndex + 1} of ${questionsList.length}`;
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.innerText = `Time Left: ${timeLeft} seconds`;
    if (timeLeft <= 0 || currentQuestionIndex >= questionsList.length) {
        clearInterval(timer); // Stop the timer when it reaches 0 or the quiz is finished
        showFinalScore();
    } else {
        timeLeft--;
    }
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < questionsList.length) {
        showQuestion(questionsList[currentQuestionIndex]);
    }
}

function showQuestion(questionData) {
    questionElement.innerText = questionData.question.text;
    
    // Combine correct and incorrect answers into one array
    const answers = [...questionData.incorrectAnswers, questionData.correctAnswer];
    // Shuffle the answers
    answers.sort(() => Math.random() - 0.5);
    
    // Iterate through the shuffled answers and create buttons
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('btn');
        if (answer === questionData.correctAnswer) {
            button.dataset.correct = true;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    clearStatusClass(document.body);
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
    answered = false;
}

function selectAnswer(e) {
    if (answered) return; // Prevent multiple clicks
    answered = true;

    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === 'true';
    setStatusClass(document.body, correct);
    if (correct) {
        score++;
    }
    Array.from(answerButtonsElement.children).forEach(button => {
        if (button !== selectedButton && button.dataset.correct === 'true') {
            setStatusClass(button, true); // Mark correct answers
        }
        button.disabled = true; // Disable all buttons
    });

    setTimeout(() => {
        currentQuestionIndex++;
        setNextQuestion();
        answered = false;
    }, 3000); // Auto-advance after 4 seconds
}


function setStatusClass(element, correctAnswer) {
    clearStatusClass(element);
    if (correctAnswer) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function showFinalScore() {
    const finalScoreElement = document.getElementById('final-score');
    finalScoreElement.innerText = `Your Final Score: ${score}`;
    scoreContainer.classList.remove('hide');

    submitScoreButton.classList.remove('hide');
    tryAgainButton.classList.remove('hide');
}

/* Scoreboard */
submitScoreButton.addEventListener('click', () => {
    // Code to submit score to leaderboard
});

tryAgainButton.addEventListener('click', () => {
    startGame();
    submitScoreButton.classList.add('hide');
    tryAgainButton.classList.add('hide');
});