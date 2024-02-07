/* Declare constants */
const startButton = document.getElementById('start-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const questionCounter = document.getElementById('question-counter');
const answerButtonsElement = document.getElementById('answer-buttons');
const timerElement = document.getElementById('timer');
const currentScoreContainer = document.getElementById('current-score-container');
const finalScoreContainer = document.getElementById('final-score-container');
const currentScoreElement = document.getElementById('current-score');
const finalScoreElement = document.getElementById('final-score');
const tryAgainButton = document.getElementById('try-again-btn');
const leaderboardButton = document.getElementById('leaderboard-form');
let timer, timeLeft, score, currentQuestionIndex, questionsList, answered;
let leaderboardScores = []; //Set leaderboard scores as an empty array - pull existing leaderboard?

/* Event Listeners */
function eventListeners() {
    // Add event listener to the start button only if it exists
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }

    // Capture data and submit to leaderboard when button clicked
    if (leaderboardButton) {
        document.getElementById('leaderboard-form').addEventListener('submit', function eventHandler(event) {
            // Prevent default form submission behavior
            event.preventDefault();
            
            // Call the captureScore function
            captureScore();

            // Remove the event listener
            this.removeEventListener('click', eventHandler);

        });
    }
}
eventListeners();

/* Updates the question counter */
function updateCounter() {
    if (!questionsList) return; // Check if questionsList is defined
    const counterElement = document.getElementById('question-counter');
    counterElement.innerText = `Question ${currentQuestionIndex + 1} of ${questionsList.length}`;
}

/* Retrieve set of 12 Film/TV questions from API */
function getQuestions() {
    let apiUrl = 'https://the-trivia-api.com/v2/questions?limit=12&categories=film_and_tv&region=GB';
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        questionsList = data;
        updateCounter(); //Call update counter after questionList is loaded
        setNextQuestion();
    });
}

/* Question timer function */
function updateTimer() {
    if (!questionsList) return; // Check if questionsList is defined
    timerElement.innerText = `Time Left: ${timeLeft} seconds`;
    if (timeLeft <= 0 || currentQuestionIndex >= questionsList.length) {
        clearInterval(timer); // Stop the timer when it reaches 0 or the quiz is finished
        showFinalScore();
    } else {
        timeLeft--;
    }
}

/* Function to move to next question */
function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < questionsList.length) {
        updateCounter(); // Update question counter
        showQuestion(questionsList[currentQuestionIndex]);
        timeLeft = 60;
    } else {
        showFinalScore(); // Call showFinalScore() if all questions have been answered
    }
}

/* Function to show question */
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

/* Remove answers and reset between questions */
function resetState() {
    clearStatusClass(document.body);
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
    answered = false;
}

/* Answer choice function */
function selectAnswer(e) {
    if (answered) return; // Prevent multiple clicks
    answered = true;

    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === 'true';
    setStatusClass(document.body, correct);
    if (correct) {
        score++; // Incremement score
        updateScore(); // Update current score
    }
    Array.from(answerButtonsElement.children).forEach(button => {
        button.disabled = true; // Disable all buttons
    });

    // Display right/wrong feedback for 4 seconds before moving to next question
    setTimeout(() => {
        currentQuestionIndex++;
        setNextQuestion();
        answered = false;
    }, 4000); // Auto-advance after 4 seconds
}

/* Set correct/wrong status to display feedback to user */
function setStatusClass(element, correctAnswer) {
    clearStatusClass(element);
    if (correctAnswer) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

/* remove correct/wrong status */
function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

/* Update current score during game */
function updateScore() {
    currentScoreElement.innerText = score; // Update current score
}

/* Show the final score and hide quiz elements */
function showFinalScore() {
    clearFinalQuestion(); // Call the function to clear the final question
    finalScoreElement.innerText = score; // Assign final score
    questionCounter.classList.add('hide'); // Hide question counter
    timerElement.classList.add('hide'); // Hide timer container
    currentScoreContainer.classList.add('hide'); // Hide current score container
    finalScoreContainer.classList.remove('hide'); // Show final score container
    tryAgainButton.classList.remove('hide'); // Show try again button
    leaderboardButton.classList.remove('hide'); // Show sumbit score button
}

/* Remove last question from element at end of game */
function clearFinalQuestion() {
    questionElement.innerText = ''; // Clear question
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild); // Remove answer buttons
    }
}

/* Function to capture player name and final score */
function captureScore() {
    // Remove event listener from start button - Was causing error?
    startButton.removeEventListener('click', startGame); 
    // Get player name from form input
    let playerNameInput = document.getElementById('player-name-submit'); // Assuming input field has id 'player-name'
    let playerName = playerNameInput.innerText;

    // Get final score from finalScoreContainer
    let finalScore = finalScoreContainer.value;

    // Create an object to store player name and final score
    let playerScore = {
        name: playerName,
        score: finalScore
    };

    // Switch to scoreboard page
    window.location.href = 'leaderboard.html';

    document.addEventListener('DOMContentLoaded', function() {
        // Get the table rows from the leaderboard
        let leaderboardRows = document.querySelectorAll('#leaderboard tbody tr');

        // Clear existing scores from the scores array
        leaderboardScores = [];

        // Iterate over the table rows and extract data
        leaderboardRows.forEach(row => {
            let name = row.cells[1].innerText;
            let score = parseInt(row.cells[2].innerText); // Assuming the score is a number
            leaderboardScores.push({ name: name, score: score });
        });

        // Add the new player score object to the leaderboardScores array
        leaderboardScores.push(playerScore);
    });
        

    // Update the leaderboard view
    updateLeaderboardView();
}


/* Update the leaderboard */
function updateLeaderboardView() {
    // Get the leaderboard table
    let leaderboardTable = document.getElementById("leaderboard");

    // Clear the tbody
    let tbody = leaderboardTable.querySelector("tbody");
    tbody.innerHTML = "";

    // Sort scores
    leaderboardScores.sort((a, b) => b.score - a.score);

    // Assign medal colours to an array
    let colors = ["gold", "silver", "#cd7f32"];

    for (let i = 0; i < leaderboardScores.length; i++) {
        let score = leaderboardScores[i];

        let row = tbody.insertRow();
        let rankCell = row.insertCell();
        let nameCell = row.insertCell();
        let scoreCell = row.insertCell();

        rankCell.textContent = i + 1;
        nameCell.textContent = score.name;
        scoreCell.textContent = score.score;

        // Apply color for top 3 ranks
        if (i < 3) {
            row.style.backgroundColor = colors[i];
        }
    }
}


/* Start Game function */
function startGame() {
    // reveal/hide page elements
    startButton.classList.add('hide');
    questionContainerElement.classList.remove('hide');
    currentScoreContainer.classList.remove('hide');
    finalScoreContainer.classList.add('hide');
    questionCounter.classList.remove('hide');
    timerElement.classList.remove('hide');

    // fetch questions for game
    getQuestions();

    // Set index to zero, set score to zero, set timer
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 60; // Set the initial time (in seconds)
    updateTimer();
    timer = setInterval(updateTimer, 1000); // Update timer every second
}