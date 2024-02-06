/* Declare constants */

const startButton = document.getElementById('start-btn')
const nextButton = document.getElementById('next-btn')
const questionContainerElement = document.getElementById('question-container')
const questionElement = document.getElementById('question')
const answerButtonsElement = document.getElementById('answer-buttons')
let timer, timeLeft, score;

/* Event Listeners */
startButton.addEventListener('click', startGame)
nextButton.addEventListener('click', () => {
    currentQuestionIndex++
    setNextQuestion()
})

/* Start Game function */
function startGame() {
    startButton.classList.add('hide');
    questionContainerElement.classList.remove('hide');
    
    getQuestions();

    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 60; // Set the initial time (in seconds)
    updateCounter();
    updateTimer();
    timer = setInterval(updateTimer, 1000); // Update timer every second
    resetState(); // Hide final score elements
    setNextQuestion();
}

/* Retrieve set of 12 Film/TV questions from API */
function getQuestions() {
    let apiUrl = 'https://the-trivia-api.com/v2/questions?limit=12&?categories=film_and_tv&?region=GB';
    fetch(apiUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        showQuestion(data);
    });
}

//Update this for incoming API object
function updateCounter() {
    const counterElement = document.getElementById('question-counter');
    counterElement.innerText = `Question ${currentQuestionIndex + 1} of ${shuffledQuestions.length}`;
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.innerText = `Time Left: ${timeLeft} seconds`;
    if (timeLeft <= 0 || currentQuestionIndex >= shuffledQuestions.length) {
        clearInterval(timer); // Stop the timer when it reaches 0 or the quiz is finished
        showFinalScore();
    } else {
        timeLeft--;
    }
}

//Update this for incoming API object
function setNextQuestion() {
    resetState()
    showQuestion(shuffledQuestions[currentQuestionIndex])
}


//Update this for incoming API object ********************
function showQuestion(data) {
    //iterate through questions
    let questionsList = data;
    let questionIndex = [0];
    questionElement.innerText = `questionsList.${questionIndex}.question.text.value`;

    //Designate correct answer button **Update required**
    question.answers.forEach(answer => {
        const button = document.createElement('button')
        button.innerText = answer.text
        button.classList.add('btn')
        if (answer.correct) {
            button.dataset.correct = answer.correct
        }
        button.addEventListener('click', selectAnswer)
        answerButtonsElement.appendChild(button)
    })
}

/* Reset Function */
function resetState() {
    clearStatusClass(document.body)
    nextButton.classList.add('hide')
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild)
    }
}

/* Choose Answer */
//Update this for incoming API object
function selectAnswer(e) {
    const selectedButton = e.target
    const correct = selectedButton.dataset.correct
    setStatusClass(document.body, correct)
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.dataset.correct)
    })
    if (shuffledQuestions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide')
    } else {
        startButton.innerText = 'Restart'
        startButton.classList.remove('hide')
    }
}

/* Answer is correct or incorrect */
//Update this for API onject
function setStatusClass(element, correctAnswer) {
    clearStatusClass(element)
    if (correct) {
        element.classList.add('correct')
    } else {
        element.classList.add('wrong')
    }
}

/* Clear right/wrong status */
function clearStatusClass(element) {
    element.classList.remove('correct')
    element.classList.remove('wrong')
}

/* Show Final Score */
function showFinalScore() {
    const scoreContainer = document.getElementById('score-container');
    const finalScoreElement = document.getElementById('final-score');
    finalScoreElement.innerText = `Your Final Score: ${score}`;
    scoreContainer.classList.remove('hide');
}

/* ? Leaderboard / Scoredboard ? */