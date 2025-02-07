const BOARD_SIZE = 8;
const NUM_MINES = 10;
const board = [];
let gameOver = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    placeMines();
    updateBoard();
});

function initializeBoard() {
    const boardElement = document.getElementById('board');
    for (let row = 0; row < BOARD_SIZE; row++) {
        const rowArray = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('touchstart', handleTouchStart);
            cell.addEventListener('touchend', handleTouchEnd);
            boardElement.appendChild(cell);
            rowArray.push({ element: cell, isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 });
        }
        board.push(rowArray);
    }
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            minesPlaced++;
        }
    }
}

function updateBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            if (cell.isRevealed) {
                cell.element.classList.add('revealed');
                if (cell.isMine) {
                    cell.element.textContent = '💣';
                } else if (cell.adjacentMines > 0) {
                    cell.element.textContent = cell.adjacentMines;
                }
            } else if (cell.isFlagged) {
                cell.element.textContent = '🚩';
            } else {
                cell.element.textContent = '';
            }
        }
    }
}

function handleCellClick(event) {
    if (gameOver) return;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];
    if (cell.isFlagged) return;
    if (cell.isMine) {
        revealAllMines();
        gameOver = true;
        document.getElementById('message').textContent = 'Game Over!';
    } else {
        revealCell(row, col);
        if (checkWin()) {
            gameOver = true;
            document.getElementById('message').textContent = 'You Win!';
        }
    }
    updateBoard();
}

function handleTouchStart(event) {
    if (gameOver) return;
    const cell = event.target;
    cell.touchTimeout = setTimeout(() => {
        flagCell(cell);
        updateBoard();
    }, 1000);
}

function handleTouchEnd(event) {
    const cell = event.target;
    if (cell.touchTimeout) {
        clearTimeout(cell.touchTimeout);
        handleCellClick(event);
    }
}

function flagCell(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const cellData = board[row][col];
    if (!cellData.isRevealed) {
        cellData.isFlagged = !cellData.isFlagged;
    }
}

function revealCell(row, col) {
    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;
    cell.isRevealed = true;
    if (cell.adjacentMines === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    revealCell(newRow, newCol);
                }
            }
        }
    }
}

function revealAllMines() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            if (cell.isMine) {
                cell.isRevealed = true;
            }
        }
    }
}

function checkWin() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            if (!cell.isMine && !cell.isRevealed) {
                return false;
            }
        }
    }
    return true;
}

function calculateAdjacentMines() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (!board[row][col].isMine) {
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;
                        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && board[newRow][newCol].isMine) {
                            count++;
                        }
                    }
                }
                board[row][col].adjacentMines = count;
            }
        }
    }
}

calculateAdjacentMines();
