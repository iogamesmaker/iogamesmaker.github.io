const ROWS = 10;
const COLS = 10;
const BOMBS = 15;

let board = [];
let gameOver = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    renderBoard();
});

function initializeBoard() {
    // Initialize the board with empty cells
    board = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({
        isBomb: false,
        revealed: false,
        flagged: false,
        adjacentBombs: 0
    })));

    // Place bombs randomly
    let bombsPlaced = 0;
    while (bombsPlaced < BOMBS) {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);
        if (!board[row][col].isBomb) {
            board[row][col].isBomb = true;
            bombsPlaced++;
        }
    }

    // Calculate adjacent bombs for each cell
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (!board[row][col].isBomb) {
                board[row][col].adjacentBombs = countAdjacentBombs(row, col);
            }
        }
    }
}

function countAdjacentBombs(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol].isBomb) {
                count++;
            }
        }
    }
    return count;
}

function renderBoard() {
    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            const cellData = board[row][col];
            if (cellData.revealed) {
                cell.classList.add('revealed');
                if (cellData.isBomb) {
                    cell.textContent = '💣';
                } else if (cellData.adjacentBombs > 0) {
                    cell.textContent = cellData.adjacentBombs;
                }
            } else if (cellData.flagged) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            }

            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleCellRightClick);
            cell.addEventListener('touchstart', handleCellTouchStart);
            cell.addEventListener('touchend', handleCellTouchEnd);

            gameElement.appendChild(cell);
        }
    }
}

let touchStartTime;

function handleCellTouchStart(event) {
    touchStartTime = new Date().getTime();
    event.preventDefault();
}

function handleCellTouchEnd(event) {
    const touchEndTime = new Date().getTime();
    const touchDuration = touchEndTime - touchStartTime;

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (touchDuration >= 1000) {
        revealCell(row, col);
    } else {
        flagCell(row, col);
    }

    event.preventDefault();
}

function handleCellClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    revealCell(row, col);
}

function handleCellRightClick(event) {
    event.preventDefault();
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    flagCell(row, col);
}

function revealCell(row, col) {
    if (gameOver || board[row][col].revealed || board[row][col].flagged) return;

    board[row][col].revealed = true;

    if (board[row][col].isBomb) {
        gameOver = true;
        alert('Game Over! You hit a bomb.');
        revealAllBombs();
        return;
    }

    if (board[row][col].adjacentBombs === 0) {
        revealAdjacentCells(row, col);
    }

    checkWin();
    renderBoard();
}

function revealAdjacentCells(row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && !board[newRow][newCol].revealed) {
                revealCell(newRow, newCol);
            }
        }
    }
}

function flagCell(row, col) {
    if (gameOver || board[row][col].revealed) return;

    board[row][col].flagged = !board[row][col].flagged;
    renderBoard();
}

function revealAllBombs() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col].isBomb) {
                board[row][col].revealed = true;
            }
        }
    }
    renderBoard();
}

function checkWin() {
    let unrevealedSafeCells = 0;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (!board[row][col].isBomb && !board[row][col].revealed) {
                unrevealedSafeCells++;
            }
        }
    }
    if (unrevealedSafeCells === 0) {
        gameOver = true;
        alert('Congratulations! You won!');
    }
}
