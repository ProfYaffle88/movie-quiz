/* Declare constants */
const startButton = document.getElementById('start-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const questionCounter = document.getElementById('question-counter');
const answerButtonsElement = document.getElementById('answer-buttons');
const timerElement = document.getElementById('timer');
const scoreContainer = document.getElementById('score-container');
const currentScoreContainer = document.getElementById('current-score-container');
const finalScoreContainer = document.getElementById('final-score-container');
const currentScoreElement = document.getElementById('current-score');
const finalScoreElement = document.getElementById('final-score');
const tryAgainButton = document.getElementById('try-again-btn');
const leaderboardButton = document.getElementById('leaderboard-form');
const seeLeaderboard = document.getElementById('leaderboard-btn');
const leaderboardEasy = document.getElementById('leaderboard-easy');
const leaderboardMedium = document.getElementById('leaderboard-medium');
const leaderboardHard = document.getElementById('leaderboard-hard');
const leaderboardRandom = document.getElementById('leaderboard-classic');
const difficultyContainer = document.getElementById('difficulty-selector-container');
const instructions = document.getElementById('instructions-btn');
const difficultyLabel = document.getElementById('diff-select-label');
let playerNameInput = document.getElementById('player-name-submit');
let playerName = '';

let timer, timeLeft, score, currentQuestionIndex, questionsList, answered, leaderboardRows, difficultyChosen;
let leaderboardScores = []; //Set leaderboard scores as an empty array

/* Global event listners */
// Event listener for difficulty selector dropdown change
document.getElementById('difficulty-selector').addEventListener('change', function(event) {
    difficultyChosen = event.target.value;
});

/* Event Listeners - "if target element exists" */
function eventListeners() {
    // Add event listener to the start button only if it exists
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }

    // Event Listener for score submit
    if (leaderboardButton) {
        document.getElementById('leaderboard-form').addEventListener('submit', function(event) {
            // Prevent default form submission behavior
            event.preventDefault();
            
            // Call the captureScore function
            captureScore();
        });
    }
    if (seeLeaderboard) {
        document.getElementById('leaderboard-btn').addEventListener('click', function(event) {
            // Prevent default form submission behavior
            event.preventDefault();
            
            // Check if a difficulty level is selected
            if (!difficultyChosen) {
                // If no difficulty level is selected, set it to "classic"
                difficultyChosen = "classic";
            }
            
            // Call the revealLeaderboard function
            revealLeaderboard();
        });
        
        document.getElementById('instructions-btn').addEventListener('click', function(event) {
            // Prevent default form submission behavior
            event.preventDefault();
            window.location = '../../../instructions.html';
        });
    }
}

eventListeners();

/* Leaderboard reveal */
function revealLeaderboard() {
    // Hide everything and reveal leaderboard table container and try again button
    startButton.classList.add('hide');
    questionContainerElement.classList.add('hide');
    currentScoreContainer.classList.add('hide');
    finalScoreContainer.classList.add('hide');
    questionCounter.classList.add('hide');
    timerElement.classList.add('hide');
    seeLeaderboard.classList.add('hide');
    difficultyLabel.classList.add('hide');
    difficultyContainer.classList.add('hide');
    if (instructions) {
        instructions.classList.add('hide');
    };
    switch (difficultyChosen) {
        case 'easy':
            leaderboardEasy.classList.remove('hide');
            break;
        case 'medium':
            leaderboardMedium.classList.remove('hide');
            break;
        case 'hard':
            leaderboardHard.classList.remove('hide');
            break;
        default:
            leaderboardRandom.classList.remove('hide');
    }
    tryAgainButton.classList.remove('hide');
    leaderboardButton.classList.add('hide'); // Hide submite score field
    
    // Apply medal colors to existing leaderboard rows
    leaderboardRows = document.querySelectorAll(`#leaderboard-${difficultyChosen} tbody tr`);
    let colors = ["gold", "silver", "#cd7f32"];

    leaderboardRows.forEach((row, index) => {
        if (index < 3) {
            row.style.backgroundColor = colors[index];
        }
    });
}

/* Updates the question counter */
function updateCounter() {
    if (!questionsList) return; // Check if questionsList is defined
    const counterElement = document.getElementById('question-counter');
    counterElement.innerText = `Question ${currentQuestionIndex + 1} of ${questionsList.length}`;
}

/* Retrieve set of 12 Film/TV questions from API */
function getQuestions() {
    let apiUrl = 'https://the-trivia-api.com/v2/questions?limit=12&categories=film_and_tv&region=GB';
    
    // Difficulty selector switch case (default is random mix)
    switch (difficultyChosen) {
        case 'easy':
            apiUrl = 'https://the-trivia-api.com/v2/questions?limit=12&categories=film_and_tv&difficulties=easy&region=GB';
            break;
        case 'medium':
            apiUrl = 'https://the-trivia-api.com/v2/questions?limit=12&categories=film_and_tv&difficulties=medium&region=GB';
            break;
        case 'hard':
            apiUrl = 'https://the-trivia-api.com/v2/questions?limit=12&categories=film_and_tv&difficulties=hard&region=GB';
            break;
        default:
            apiUrl = 'https://the-trivia-api.com/v2/questions?limit=12&categories=film_and_tv&region=GB'; // Random selection of all difficulties - roll those dice!!!
    } 
    
    
    
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
        timerElement.classList.remove('hide'); //Reset to 60 and unhide timer
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
    timerElement.classList.add('hide'); // // hide timer when answer selected
    if (answered) return; // Prevent multiple clicks
    answered = true;

    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === 'true';
    // Set status class based on correctness - HTML body
    setStatusClass(document.body, correct);
    // Set status class based on correctness - Selected Button
    setStatusClass(selectedButton, correct);
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
        element.classList.add('correct', 'btn.correct');
    } else {
        element.classList.add('wrong', 'btn.wrong');
    }
}

/* remove correct/wrong status */
function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
    element.classList.remove('btn.correct');
    element.classList.remove('btn.wrong');
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
    seeLeaderboard.classList.remove('hide'); // Show "See Leaderboard" button to view without submitting score
    

    // Add event listener to playerNameInput
    playerNameInput.addEventListener('input', function(event) {

    // Update playerName variable when input value changes
    playerName = event.target.value;
});
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
    
    // Check if a difficulty level is selected
    if (!difficultyChosen) {
        // If no difficulty level is selected, set it to "classic"
        difficultyChosen = "classic";
    }
    
    // Get player name from form input
    playerNameInput = document.getElementById('player-name-submit');
    playerName = playerNameInput.value;

    // Get final score from finalScoreElement
    let finalScore = finalScoreElement.innerText;

    // Create an object to store player name and final score
    let playerScore = {
        name: playerName,
        score: finalScore
    };

    // Get the table rows from the leaderboard - switch case for difficulty
        switch (difficultyChosen) {
            case 'easy':
                leaderboardRows = document.querySelectorAll('#leaderboard-easy tbody tr');
                break;
            case 'medium':
                leaderboardRows = document.querySelectorAll('#leaderboard-medium tbody tr');
                break;
            case 'hard':
                leaderboardRows = document.querySelectorAll('#leaderboard-hard tbody tr');
                break;
            default:
                leaderboardRows = document.querySelectorAll('#leaderboard-classic tbody tr');
        }

    // Clear existing scores from the scores array
    leaderboardScores = [];

    // Iterate over the table rows and extract data
    leaderboardRows.forEach(row => {
        let name = row.cells[1].innerText;
        let score = parseInt(row.cells[2].innerText); // Score is a number
        leaderboardScores.push({ name: name, score: score });
    });

    // Add the new player score object to the leaderboardScores array
    leaderboardScores.push(playerScore);

    // Update the leaderboard view
    updateLeaderboardView();
    revealLeaderboard();
}


/* Update the leaderboard */
function updateLeaderboardView() {
    // Get the leaderboard table
    let leaderboardTable = document.getElementById(`leaderboard-${difficultyChosen}`);

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
    if (window.location.pathname !== '/index.html') {
        // Redirect to index.html
        window.location.href = '../../../index.html';
        return; // Stop further execution of the function
    }
    
    // reveal/hide page elements
    scoreContainer.classList.remove('hide');
    startButton.classList.add('hide');
    questionContainerElement.classList.remove('hide');
    currentScoreContainer.classList.remove('hide');
    finalScoreContainer.classList.add('hide');
    questionCounter.classList.remove('hide');
    timerElement.classList.remove('hide');
    seeLeaderboard.classList.add('hide');
    difficultyLabel.classList.add('hide');
    difficultyContainer.classList.add('hide');
    instructions.classList.add('hide');

    // fetch questions for game
    getQuestions();

    // Set index to zero, set score to zero, set timer
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 60; // Set the initial time (in seconds)
    updateTimer();
    timer = setInterval(updateTimer, 1000); // Update timer every second
}