const gridSize = 5;
const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
let currentPlayerIndex = 0;
let explosionQueue = [];
let explosionsInProgress = false;
let playerStates = {}; // Track player states (active/inactive) and moves
let players = [];
let gameOver = false;

initializeGame();

document.addEventListener("DOMContentLoaded", () => {
    const startGameButton = document.getElementById("start-game");
    startGameButton.addEventListener("click", initializeGame);
});

function initializeGame() {
    const playerCount = parseInt(document.getElementById("player-count").value);
    players = ['red', 'blue', 'green', 'yellow'].slice(0, playerCount); // Set players based on selection

    // Reset the grid
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            grid[row][col] = null;
        }
    }

    // Initialize player states
    playerStates = {
        red: {active: false, moveSize: 3},
        blue: {active: false, moveSize: 3},
        green: {active: false, moveSize: 3}
    };
    players.forEach((player) => {
        playerStates[player] = {
            active: true,
            moveSize: 3, // Each player starts with a bonus
        };
    });

    currentPlayerIndex = 0; // Start with the first player

    // Clear the board and reinitialize it
    const board = document.getElementById("board");
    board.innerHTML = ''; // Clear existing cells
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Ensure equal-sized cells
    board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`; // Ensure equal-sized rows

    // Create the grid
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", () => handleCellClick(row, col));
            board.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    const currentPlayer = players[currentPlayerIndex];

    if(playerStates[currentPlayer].moveSize === 0) {
        playerStates[currentPlayer].active = false;
    } else {
        if (explosionsInProgress) return; // Prevent clicking during explosions

        const cell = grid[row][col];

        // Check if the cell belongs to the current player or is empty
        if (cell && cell.player !== currentPlayer) return;

        grid[row][col] = cell ? { player: currentPlayer, count: cell.count + 1 } : { player: currentPlayer, count: playerStates[currentPlayer].moveSize };

        playerStates[currentPlayer].moveSize = 1;
    }
    updateBoard();
    checkExplosions();

    // Switch to the next active player
    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } while (!playerStates[players[currentPlayerIndex]].active);
}

function hasCells(player) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] && grid[row][col].player === player) {
                return true;
            }
        }
    }
    return false;
}

function checkGameOver() {
    const currentPlayer = players[currentPlayerIndex];

    if (playerStates['red'].moveSize === 1 && !hasCells('red')) {
        playerStates['red'].active = false;
        playerStates['red'].moveSize = 0;
    }
    if (playerStates['blue'].moveSize === 1 && !hasCells('blue')) {
        playerStates['blue'].active = false;
        playerStates['blue'].moveSize = 0;
    }
    if (playerStates['green'].moveSize === 1 && !hasCells('green')) {
        playerStates['green'].active = false;
        playerStates['green'].moveSize = 0;

    }

    const activePlayers = players.filter(player => playerStates[player].active);
    if (activePlayers.length === 1) {
        if(gameOver === false) {
        alert(`${activePlayers[0]} wins!`);
            gameOver = true;
        }
    }
}

function checkExplosions() {
    explosionQueue = []; // Reset the queue

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = grid[row][col];
            if (cell && cell.count >= 4) {
                explosionQueue.push([row, col]);
            }
        }
    }

    if (explosionQueue.length > 0) processExplosionQueue();
}

function processExplosionQueue() {
    explosionsInProgress = true;

    const interval = setInterval(() => {
        if (explosionQueue.length === 0) {
            clearInterval(interval);
            explosionsInProgress = false;
            checkExplosions(); // Recheck for any new explosions
            return;
        }

        const [row, col] = explosionQueue.shift();
        explodeCell(row, col);
        updateBoard();
    }, 250);
    checkGameOver();
}

function explodeCell(row, col) {
    const cell = grid[row][col];
    if (cell.count > 4) {
        grid[row][col] = { player: cell.player, count: cell.count - 4 };
    } else {
        grid[row][col] = null;
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.style.backgroundColor = '#eee';
    }

    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    for (const [dr, dc] of directions) {
        const newRow = row + dr, newCol = col + dc;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            const neighbor = grid[newRow][newCol];
            if (!neighbor) {
                grid[newRow][newCol] = { player: cell.player, count: 1 };
            } else {
                grid[newRow][newCol] = { player: cell.player, count: neighbor.count + 1 };
            }
        }
    }
}

function updateBoard() {
    document.querySelectorAll(".cell").forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const gridCell = grid[row][col];

        let existingBalls = Array.from(cell.children);
        let newBallCount = gridCell ? gridCell.count : 0;

        if (!gridCell) {
            cell.innerHTML = '';
            return;
        }

        let positions = [];
        switch (gridCell.count) {
            case 1:
                positions = [{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }];
                break;
            case 2:
                positions = [
                    { top: '50%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '50%', left: '65%', transform: 'translate(-50%, -50%)' }
                ];
                break;
            case 3:
                positions = [
                    { top: '35%', left: '50%', transform: 'translate(-50%, -50%)' },{ top: '65%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '65%', left: '65%', transform: 'translate(-50%, -50%)' }
                ];
                break;
            case 4:
                positions = [
                    { top: '35%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '35%', left: '65%', transform: 'translate(-50%, -50%)' },{ top: '65%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '65%', left: '65%', transform: 'translate(-50%, -50%)' }
                ];
                break;
            case 5:
                positions = [
                    { top: '35%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '35%', left: '65%', transform: 'translate(-50%, -50%)' },{ top: '65%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '65%', left: '65%', transform: 'translate(-50%, -50%)' },{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                ];
                break;
            case 6:
                positions = [
                    { top: '35%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '35%', left: '65%', transform: 'translate(-50%, -50%)' },{ top: '65%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '65%', left: '65%', transform: 'translate(-50%, -50%)' },{ top: '50%', left: '35%', transform: 'translate(-50%, -50%)' },{ top: '50%', left: '65%', transform: 'translate(-50%, -50%)' }
                ];
                break;
        }

        while (existingBalls.length > newBallCount) {
            existingBalls.pop().remove();
        }

        positions.forEach((pos, index) => {
            let ball;
            if (existingBalls[index]) {
                ball = existingBalls[index];
                ball.style.backgroundColor = '#ccc';
            } else {
                ball = document.createElement('div');
                ball.classList.add('ball');
                ball.style.backgroundColor = '#ccc';
                ball.style.position = 'absolute';
                ball.style.width = '25%';
                ball.style.height = '25%';
                ball.style.borderRadius = '50%';
                ball.style.top = '50%';
                ball.style.left = '50%';
                ball.style.transform = 'translate(-50%, -50%)';
                let bgColor = '';
                if(gridCell.player == 'red') {
                    bgColor = '#fff';
                }
                if(gridCell.player == 'blue') {
                    bgColor = '#000';
                }
                if(gridCell.player == 'green') {
                    bgColor = '#999';
                }
                cell.style.backgroundColor = bgColor;
                cell.appendChild(ball);
                existingBalls.push(ball);
            }

            setTimeout(() => {
                Object.assign(ball.style, {
                    transition: 'top 0.3s ease, left 0.3s ease, background-color 0.3s ease',
                    ...pos
                });
            }, 50);
        });
    });
}

