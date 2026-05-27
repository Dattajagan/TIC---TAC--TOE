const boardCells = Array.from(document.querySelectorAll('.cell'));
const modeSelect = document.querySelector('#mode');
const messageText = document.querySelector('#message');
const resetButton = document.querySelector('#reset');
const scoreX = document.querySelector('#scoreX');
const scoreO = document.querySelector('#scoreO');
const scoreDraw = document.querySelector('#scoreDraw');

const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

let boardState = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;
let gameMode = 'two';
let scores = { X: 0, O: 0, draw: 0 };

function initializeGame() {
    boardState.fill('');
    currentPlayer = 'X';
    isGameActive = true;
    boardCells.forEach((cell) => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.disabled = false;
    });
    if (gameMode === 'single') {
        messageText.textContent = 'Single player mode: X goes first against the CPU.';
    } else {
        messageText.textContent = 'Ready to play? X starts.';
    }
    updateScoreboard();
}

function updateScoreboard() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}

function handleCellClick(event) {
    const clickedCell = event.currentTarget;
    const index = Number(clickedCell.dataset.index);

    if (!isGameActive || boardState[index]) {
        return;
    }

    markCell(clickedCell, index);
    evaluateGameResult();
}

function markCell(cell, index) {
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    cell.disabled = true;
}

function evaluateGameResult() {
    const winningInfo = findWinningPattern();

    if (winningInfo) {
        endGameWithWinner(winningInfo);
        return;
    }

    if (boardState.every((cell) => cell !== '')) {
        scores.draw += 1;
        isGameActive = false;
        messageText.textContent = 'It’s a draw! Nice game.';
        updateScoreboard();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (gameMode === 'single' && currentPlayer === 'O') {
        messageText.textContent = 'CPU is thinking...';
        setTimeout(executeCpuMove, 400);
    } else {
        messageText.textContent = `Turn: ${currentPlayer}`;
    }
}

function executeCpuMove() {
    if (!isGameActive) return;

    const bestMove = getCpuMove();
    if (bestMove === null) return;

    const cell = boardCells[bestMove];
    markCell(cell, bestMove);
    evaluateGameResult();
}

function getCpuMove() {
    const winningMove = findStrategicMove('O');
    if (winningMove !== null) return winningMove;

    const blockMove = findStrategicMove('X');
    if (blockMove !== null) return blockMove;

    if (boardState[4] === '') return 4;

    const corners = [0, 2, 6, 8].filter((idx) => !boardState[idx]);
    if (corners.length) return pickRandom(corners);

    const sides = [1, 3, 5, 7].filter((idx) => !boardState[idx]);
    if (sides.length) return pickRandom(sides);

    return null;
}

function findStrategicMove(player) {
    for (const [a, b, c] of winningPatterns) {
        const line = [boardState[a], boardState[b], boardState[c]];
        const emptyIndex = [a, b, c].find((idx) => boardState[idx] === '');
        if (!emptyIndex && emptyIndex !== 0) continue;
        const filled = line.filter((value) => value === player).length;
        const empties = line.filter((value) => value === '').length;
        if (filled === 2 && empties === 1) {
            return emptyIndex;
        }
    }
    return null;
}

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function findWinningPattern() {
    return winningPatterns.find((pattern) => {
        const [a, b, c] = pattern;
        return (
            boardState[a] &&
            boardState[a] === boardState[b] &&
            boardState[b] === boardState[c]
        );
    });
}

function endGameWithWinner(pattern) {
    const winner = boardState[pattern[0]];
    scores[winner] += 1;
    isGameActive = false;

    pattern.forEach((index) => {
        boardCells[index].classList.add('win');
    });

    if (gameMode === 'single' && winner === 'O') {
        messageText.textContent = 'CPU wins! Try again.';
    } else {
        messageText.textContent = `Winner: ${winner}! Tap New Game to play again.`;
    }

    updateScoreboard();
}

resetButton.addEventListener('click', initializeGame);
modeSelect.addEventListener('change', (event) => {
    gameMode = event.target.value;
    initializeGame();
});

boardCells.forEach((cell) => cell.addEventListener('click', handleCellClick));

initializeGame();
