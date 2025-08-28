// Game state variables
let gameActive = false;
let currentPlayer = 'X';
let gameMode = null; // 'human' or 'ai'
let gameState = ['', '', '', '', '', '', '', '', ''];

// DOM elements
const statusMessage = document.getElementById('status-message');
const turnIndicator = document.getElementById('turn-indicator');
const cells = document.querySelectorAll('.cell');
const playHumanBtn = document.getElementById('play-human');
const playAIBtn = document.getElementById('play-ai');
const resetBtn = document.getElementById('reset-game');

// Winning combinations
const winningConditions = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
];

// Messages
const winMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

// Initialize game
function initGame(mode) {
    gameMode = mode;
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    
    // Reset UI
    statusMessage.textContent = currentPlayerTurn();
    turnIndicator.textContent = `Player X: You | Player O: ${mode === 'human' ? 'Player 2' : 'AI'}`;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner', 'disabled');
    });
    
    // Enable game board
    document.querySelector('.game-board').classList.remove('disabled');
}

// Handle cell click
function handleCellClick(clickedCellEvent) {
    if (!gameActive) return;
    
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    // Check if cell is already played or game is over
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Update game state and UI
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    
    // Check for win or draw
    if (checkWin()) {
        endGame(false);
        return;
    }
    
    if (checkDraw()) {
        endGame(true);
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusMessage.textContent = currentPlayerTurn();
    
    // If playing against AI and it's AI's turn
    if (gameMode === 'ai' && currentPlayer === 'O') {
        setTimeout(makeAIMove, 700);
    }
}

// Check for win
function checkWin() {
    let roundWon = false;
    
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const condition = gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c];
        
        if (condition) {
            roundWon = true;
            // Highlight winning cells
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');
            break;
        }
    }
    
    return roundWon;
}

// Check for draw
function checkDraw() {
    return !gameState.includes('');
}

// End game
function endGame(isDraw) {
    gameActive = false;
    
    if (isDraw) {
        statusMessage.textContent = drawMessage();
    } else {
        statusMessage.textContent = winMessage();
    }
    
    document.querySelector('.game-board').classList.add('disabled');
}

// AI move logic
function makeAIMove() {
    if (!gameActive || currentPlayer !== 'O') return;
    
    // Check if AI can win in the next move
    const winMove = findBestMove('O');
    if (winMove !== -1) {
        makeMove(winMove);
        return;
    }
    
    // Check if player can win in the next move and block
    const blockMove = findBestMove('X');
    if (blockMove !== -1) {
        makeMove(blockMove);
        return;
    }
    
    // Take center if available
    if (gameState[4] === '') {
        makeMove(4);
        return;
    }
    
    // Take a corner if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => gameState[corner] === '');
    if (availableCorners.length > 0) {
        const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        makeMove(randomCorner);
        return;
    }
    
    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(side => gameState[side] === '');
    if (availableSides.length > 0) {
        const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
        makeMove(randomSide);
        return;
    }
}

// Find best move for AI
function findBestMove(player) {
    // Check each winning condition
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        
        // Check if two cells have the player's mark and the third is empty
        if (gameState[a] === player && gameState[b] === player && gameState[c] === '') {
            return c;
        }
        if (gameState[a] === player && gameState[c] === player && gameState[b] === '') {
            return b;
        }
        if (gameState[b] === player && gameState[c] === player && gameState[a] === '') {
            return a;
        }
    }
    
    return -1; // No winning move found
}

// Make a move (for AI)
function makeMove(index) {
    gameState[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    cells[index].classList.add(currentPlayer.toLowerCase());
    
    // Check for win or draw
    if (checkWin()) {
        endGame(false);
        return;
    }
    
    if (checkDraw()) {
        endGame(true);
        return;
    }
    
    // Switch player
    currentPlayer = 'X';
    statusMessage.textContent = currentPlayerTurn();
}

// Event listeners
playHumanBtn.addEventListener('click', () => initGame('human'));
playAIBtn.addEventListener('click', () => initGame('ai'));
resetBtn.addEventListener('click', () => {
    if (gameMode) {
        initGame(gameMode);
    } else {
        statusMessage.textContent = 'Select game mode to start';
        turnIndicator.textContent = '';
    }
});

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});