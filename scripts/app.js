const tileDisplay = document.querySelector('.tile-container');
const keyDisplay = document.querySelector('.key-container');
const messageDisplay = document.querySelector('.message-container');
const menuDisplay = document.querySelector('.menu-container');
const scoreCountdown = document.querySelector('#currentScore');
const scoreButton = document.getElementById('scoreButton');
const scoreBoard = document.querySelector('.scoreboard');
const scoreContent = document.querySelector('.scoreboard-body');
const scorePlayer = document.querySelector('.scoreboard-player');
const start = document.getElementById('startButton');
const closeButton = document.querySelector('.close');

let wordle;
const getWordle = () => {
    fetch('https://daily-wordle.herokuapp.com/word')
        .then(res => res.json())
        .then(json => {
            wordle = json.toUpperCase();
        }).catch(err => console.log(err));
}

getWordle();

const keys = [
    'Q','W','E','R','T','Y','U','I','O','P',
    'A','S','D','F','G','H','J','K','L','ENTER',
    'Z','X','C','V','B','N','M','<<'
];

const guessRows = [
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','','']
];

const initialHighScores = [{name:'Yao',score: 100}, {name:'Bot66',score: 98}, 
                    {name:'Drifter',score: 97}, {name:'S.A.S',score: 89}, 
                    {name:'Joe Smit',score: 79}];

window.localStorage.setItem('scores', JSON.stringify(initialHighScores));

const highScores = JSON.parse(window.localStorage.getItem('scores'));

let currentRow = 0;
let currentTile = 0;
let currentScore = 100;
let isGameOver = false;
let update;
let gameStarted = false;

guessRows.forEach((guessRow, RowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.setAttribute('id', 'guessRow-' + RowIndex);

    guessRow.forEach((guess, tileIndex) => {
        const tileElement = document.createElement('div');
        tileElement.setAttribute('id', 'guessRow-' + RowIndex + '-tile-' + tileIndex);
        tileElement.classList.add('tile');
        rowElement.append(tileElement);
    })

    tileDisplay.append(rowElement);
})

keys.forEach(key => {
    const keyElement = document.createElement('button');
    keyElement.textContent = key;
    keyElement.setAttribute('id', key);
    keyElement.addEventListener('click', () => handleClick(key))
    keyDisplay.append(keyElement);
})

const handleClick = (key) => {
    if (key === '<<') {
        deleteLetter();
        return;
    }
    if (key === 'ENTER') {
        checkRow();
        return;
    }
    addLetter(key);
}

const addLetter = (letter) => {
    if(currentTile < 5 && currentRow < 6 && !isGameOver) {
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
    tile.textContent = letter;
    tile.setAttribute('data', letter)
    guessRows[currentRow][currentTile] = letter;
    currentTile++;
    }
}

const deleteLetter = () => {
    if(currentTile > 0 && !isGameOver) {
    currentTile--;
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
    tile.textContent = '';
    tile.setAttribute('data', '');
    guessRows[currentRow][currentTile] = '';
    }
}

const checkRow = async () => {
    if (currentTile > 4 && !isGameOver) {
        flipTile();
        const guess = guessRows[currentRow].join('');

        await fetch(`https://daily-wordle.herokuapp.com/check/?word=${guess}`)
            .then((res) => res.json())
            .then(json => {
                if (json == false) {
                    if (currentRow >= 5) {
                        isGameOver = true;
                        showMessage('Game Over! Try Again! Word was: ' + wordle);
                        clearInterval(update);
                    } else {
                        showMessage('Not a valid word guess!')
                    }
                    return
                } else {
                    if (guess == wordle) {
                        isGameOver = true;
                        showMessage('Excellent job! You Won!');
                        clearInterval(update);
                        loadPlayerScore();
                        return;
                    } else {
                        if (currentRow >= 5) {
                            isGameOver = true;
                            showMessage('Game Over! Try Again! Word was: ' + wordle);
                            clearInterval(update);
                            return;
                        }
                    }
                }
            }).catch(err => console.log(err));

            currentRow++;
            currentTile = 0;
    }
}

const showMessage = (message) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageDisplay.append(messageElement);

    if (!isGameOver) {
        setTimeout(() => {
        messageDisplay.removeChild(messageElement)
        }, 2000);
    }
}

const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes;

    rowTiles.forEach((tile, i) => {
        const tileLetter = tile.getAttribute('data');

        setTimeout(() => {
            tile.classList.add('flip');
    
            if (tileLetter == wordle[i]) {
                tile.classList.add('green');
                keyColor(tileLetter, 'green');
            } else if (wordle.includes(tileLetter)) {
                tile.classList.add('yellow');
                keyColor(tileLetter, 'yellow');
            } else {
                tile.classList.add('grey');
                keyColor(tileLetter, 'grey');
            }
        }, 500 * i);
    })
}

const keyColor = ((letter, color) => {
    const key = document.getElementById(letter);
    if(key.classList.contains('green')) {
        key.classList.remove('yellow','grey');
        return;
    } else if (key.classList.contains('yellow' ) && color == 'green') {
        key.classList.remove('yellow','grey');
        key.classList.add(color);
        return;
    } else {
        key.classList.remove('grey');
        key.classList.add(color);
    }
})

scoreButton.addEventListener('click', () => showScore());
closeButton.addEventListener('click', () => scoreBoard.style.display = 'none');

window.onclick = (event) => {
    if (event.target == scoreBoard) {
      scoreBoard.style.display = "none";
    }
}

const loadScores = () => {
    const scoreList = document.createElement('table');
    const scoreHeader = document.createElement('tr');
    const headerName = document.createElement('th');
    const headerScore = document.createElement('th');
    headerName.textContent = 'Name';
    headerScore.textContent = 'Score';
    scoreHeader.append(headerName,headerScore);
    scoreList.append(scoreHeader);

    highScores.forEach((player) => {
        const scoreRows = document.createElement('tr');
        const nameElement = document.createElement('td');
        const scoreElement = document.createElement('td');
        nameElement.textContent = player.name;
        scoreElement.textContent = player.score;
        scoreRows.append(nameElement,scoreElement);
        scoreList.append(scoreRows);
    })
    scoreContent.append(scoreList);
}

loadScores();

const showScore = () => {
    scoreBoard.style.display = 'block';
}

start.addEventListener('click', () => startGame());

const startGame = () => {
    if (!gameStarted) {
        gameStarted = true;
        scoreCountdown.textContent = currentScore;
        scorePlayer.style.display = 'none';
        keyDisplay.style.pointerEvents = 'auto';

        update = setInterval(() => {
            updateScore();
        }, 1000);
    }
    if(gameStarted && isGameOver) {
        location.reload();
    }
}

const updateScore = () => {
    currentScore--;
    scoreCountdown.textContent = currentScore;

    if (currentScore == 0) {
        showMessage('Game Over! Try Again! Word was: ' + wordle);
        isGameOver = true;
        clearInterval(update);
        return;
    }
}

const loadPlayerScore = () => {
    const playerScore = document.createElement('p');
    playerScore.textContent = 'Your score is: ' + currentScore;
    scorePlayer.append(playerScore);
    scorePlayer.style.display = 'block';
    showScore();
}

const checkHighScore = (playerScore) => {
    highScores.forEach((player, i) => {
        if (playerScore > player.score) {
            showMessage('Congratulations! You are in the leaderboards!');
        }
    });
}