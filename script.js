document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const messageElement = document.getElementById('message');
    const restartButton = document.getElementById('restart');
    const undoButton = document.getElementById('undo');
    const resetScoresButton = document.getElementById('resetScores');
    const toggleSoundButton = document.getElementById('toggleSound');
    const playerXScoreElement = document.getElementById('playerXScore');
    const playerOScoreElement = document.getElementById('playerOScore');
    const timeLeftElement = document.getElementById('timeLeft');
    const themeButtons = document.querySelectorAll('.theme-button');
    const startGameButton = document.getElementById('startGame');
    const playerXNameInput = document.getElementById('playerXName');
    const playerONameInput = document.getElementById('playerOName');
    const boardElement = document.getElementById('board');
    const statisticsElement = document.getElementById('statistics');
    const playWithAIButton = document.getElementById('playWithAI');

    let currentPlayer = 'X';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let isGameActive = false;
    let moveHistory = [];
    let soundOn = true;
    let gameStatistics = {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0
    };
    let playWithAI = false;

    let playerXWins = parseInt(localStorage.getItem('playerXWins')) || 0;
    let playerOWins = parseInt(localStorage.getItem('playerOWins')) || 0;
    let timeLeft = 10;
    let timer;

    const clickSound = new Audio('click.mp3');
    const winSound = new Audio('win.wav');
    const tieSound = new Audio('tie.wav');

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    const updateScores = () => {
        playerXScoreElement.textContent = `${playerXNameInput.value || 'Player X'} Wins: ${playerXWins}`;
        playerOScoreElement.textContent = `${playerONameInput.value || 'Player O'} Wins: ${playerOWins}`;
    };

    const updateStatistics = () => {
        statisticsElement.textContent = `Games Played: ${gameStatistics.gamesPlayed}, Wins: ${gameStatistics.wins}, Losses: ${gameStatistics.losses}, Ties: ${gameStatistics.ties}`;
    };

    const startTimer = () => {
        timeLeft = 10;
        timeLeftElement.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timeLeftElement.textContent = timeLeft;
            if (timeLeft === 0) {
                clearInterval(timer);
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                timeLeft = 10;
                startTimer();
            }
        }, 1000);
    };

    const handleCellClick = (event) => {
        const cell = event.target;
        const cellIndex = parseInt(cell.getAttribute('data-index'));

        if (gameBoard[cellIndex] !== '' || !isGameActive) {
            return;
        }

        if (soundOn) clickSound.play
        gameBoard[cellIndex] = currentPlayer;
        cell.textContent = currentPlayer;
        moveHistory.push({ player: currentPlayer, index: cellIndex });

        if (checkWinner()) {
            if (soundOn) winSound.play();
            messageElement.textContent = `${currentPlayer} wins!`;
            if (currentPlayer === 'X') playerXWins++;
            else playerOWins++;
            gameStatistics.gamesPlayed++;
            gameStatistics.wins++;
            updateScores();
            updateStatistics();
            isGameActive = false;
        } else if (gameBoard.every(cell => cell !== '')) {
            if (soundOn) tieSound.play();
            messageElement.textContent = `It's a tie!`;
            gameStatistics.gamesPlayed++;
            gameStatistics.ties++;
            updateStatistics();
            isGameActive = false;
        } else {
            if (playWithAI && currentPlayer === 'O' && isGameActive) {
                setTimeout(makeAIMove, 1000);
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            }
        }
    };

    const makeAIMove = () => {
        let emptyCells = [];
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === '') {
                emptyCells.push(i);
            }
        }

        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const aiMoveIndex = emptyCells[randomIndex];
        gameBoard[aiMoveIndex] = 'O';
        cells[aiMoveIndex].textContent = 'O';
        moveHistory.push({ player: 'O', index: aiMoveIndex });

        if (checkWinner()) {
            if (soundOn) winSound.play();
            messageElement.textContent = `AI wins!`;
            playerOWins++;
            gameStatistics.gamesPlayed++;
            gameStatistics.losses++;
            updateScores();
            updateStatistics();
            isGameActive = false;
        } else if (gameBoard.every(cell => cell !== '')) {
            if (soundOn) tieSound.play();
            messageElement.textContent = `It's a tie!`;
            gameStatistics.gamesPlayed++;
            gameStatistics.ties++;
            updateStatistics();
            isGameActive = false;
        } else {
            currentPlayer = 'X';
        }
    };

    const checkWinner = () => {
        return winningCombinations.some(combination => {
            return combination.every(index => {
                return gameBoard[index] === currentPlayer;
            });
        });
    };

    const restartGame = () => {
        currentPlayer = 'X';
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        messageElement.textContent = '';
        cells.forEach(cell => cell.textContent = '');
        clearInterval(timer);
        startTimer();

        if (playWithAI && currentPlayer === 'O') {
            setTimeout(makeAIMove, 1000);
        }
    };

    const resetScores = () => {
        playerXWins = 0;
        playerOWins = 0;
        localStorage.setItem('playerXWins', playerXWins);
        localStorage.setItem('playerOWins', playerOWins);
        updateScores();
    };

    const undoLastMove = () => {
        if (moveHistory.length === 0 || !isGameActive) return;

        const lastMove = moveHistory.pop();
        gameBoard[lastMove.index] = '';
        cells[lastMove.index].textContent = '';
        currentPlayer = lastMove.player;
        if (currentPlayer === 'O' && playWithAI) {
            setTimeout(undoLastMove, 100);
        }
    };

    const changeTheme = (theme) => {
        document.body.className = theme + '-theme';
    };

    const startGame = () => {
        const playerXName = playerXNameInput.value.trim();
        const playerOName = playerONameInput.value.trim();

        if (playerXName) playerXScoreElement.textContent = `${playerXName} Wins: ${playerXWins}`;
        if (playerOName) playerOScoreElement.textContent = `${playerOName} Wins: ${playerOWins}`;

        isGameActive = true;
        document.getElementById('board').classList.remove('hidden');
        document.getElementById('restart').classList.remove('hidden');
        document.getElementById('undo').classList.remove('hidden');
        document.getElementById('timer').classList.remove('hidden');
        playWithAIButton.classList.add('hidden');
        startGameButton.classList.add('hidden');
        generateBoard();
        startTimer();

        if (playWithAI && currentPlayer === 'O') {
            setTimeout(makeAIMove, 1000);
        }
    };

    const toggleSound = () => {
        soundOn = !soundOn;
        toggleSoundButton.textContent = soundOn ? 'Mute Sound' : 'Unmute Sound';
    };

    const generateBoard = () => {
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(3, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(3, 1fr)`;

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', (event) => {
                if (isGameActive && (currentPlayer === 'X' || !playWithAI)) {
                    handleCellClick(event);
                    clearInterval(timer);
                    if (isGameActive && currentPlayer === 'O' && playWithAI) {
                        setTimeout(makeAIMove, 1000);
                    } else if (isGameActive) {
                        startTimer();
                    }
                }
            });
            boardElement.appendChild(cell);
        }

        gameBoard = Array(9).fill('');
    };

    restartButton.addEventListener('click', restartGame);
    resetScoresButton.addEventListener('click', resetScores);
    undoButton.addEventListener('click', undoLastMove);
    themeButtons.forEach(button => button.addEventListener('click', (event) => {
        changeTheme(event.target.getAttribute('data-theme'));
    }));
    startGameButton.addEventListener('click', startGame);
    toggleSoundButton.addEventListener('click', toggleSound);

    updateScores();
    updateStatistics();
});