const gridSize = 8;
const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
let currentPlayer = 'red';
let explosionQueue = [];
let explosionsInProgress = false;

document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Ensure equal-sized cells
    board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`; // Ensure equal-sized rows

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
});


function handleCellClick(row, col) {
    if (explosionsInProgress) return; // Prevent clicking during explosions
    const cell = grid[row][col];
    if (cell && cell.player !== currentPlayer) return;

    grid[row][col] = cell ? { player: currentPlayer, count: cell.count + 1 } : { player: currentPlayer, count: 1 };
    updateBoard();
    checkExplosions();
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
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
}

function explodeCell(row, col) {
    const cell = grid[row][col];
    if (cell.count > 4) {
        grid[row][col] = { player: cell.player, count: cell.count - 4 };
    } else {
        grid[row][col] = null;
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.style.backgroundColor = '#ccc';
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
                cell.appendChild(ball);
                let bgColor = '';
                if(gridCell.player == 'red') {
                    bgColor = '#f55';
                }
                if(gridCell.player == 'blue') {
                    bgColor = '#55f';
                }
                if(gridCell.player == 'green') {
                    bgColor = '#5f5';
                }
                if(gridCell.playerZ == 'yellow') {
                    bgColor = '#ff5';
                }
                cell.style.backgroundColor = bgColor;
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
