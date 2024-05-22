const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ROWS = 50;
const COLS = 50;
const CELL_SIZE = canvas.width / COLS;
let grid = [];
let startNode = null;
let endNode = null;
let isDrawingWall = false;

// Node class
class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.x = col * CELL_SIZE;
        this.y = row * CELL_SIZE;
        this.isWall = false;
        this.isStart = false;
        this.isEnd = false;
        this.previous = null;
        this.g = 0;
        this.h = 0;
        this.f = 0;
    }

    draw(color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
    }
}

// Initialize grid
function initGrid() {
    grid = [];
    for (let row = 0; row < ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < COLS; col++) {
            const node = new Node(row, col);
            currentRow.push(node);
            node.draw('white');
        }
        grid.push(currentRow);
    }
}

// Heuristic function (Manhattan distance)
function heuristic(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// A* Algorithm
function aStar() {
    const openSet = [startNode];
    const closedSet = [];
    
    while (openSet.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }

        const current = openSet[lowestIndex];

        if (current === endNode) {
            let temp = current;
            while (temp.previous) {
                temp.draw('purple');
                temp = temp.previous;
            }
            startNode.draw('blue');
            endNode.draw('grey');
            return;
        }

        openSet.splice(lowestIndex, 1);
        closedSet.push(current);

        current.isClosed = true;
        current.draw('red');

        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            if (closedSet.includes(neighbor) || neighbor.isWall) continue;

            const tempG = current.g + 1;

            let newPath = false;
            if (openSet.includes(neighbor)) {
                if (tempG < neighbor.g) {
                    neighbor.g = tempG;
                    newPath = true;
                }
            } else {
                neighbor.g = tempG;
                newPath = true;
                openSet.push(neighbor);
            }

            if (newPath) {
                neighbor.h = heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = current;
                neighbor.draw('green');
            }
        }
    }
}

// Get neighbors of a node
function getNeighbors(node) {
    const neighbors = [];
    const { row, col } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]);

    return neighbors;
}

// Generate a random maze
function generateMaze() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const node = grid[row][col];
            if (Math.random() < 0.3) { // 30% chance to be a wall
                node.isWall = true;
                node.draw('black');
            } else {
                node.isWall = false;
                node.draw('white');
            }
        }
    }
    // Ensure start and end nodes are not walls
    if (startNode) startNode.isWall = false;
    if (endNode) endNode.isWall = false;
}

// Handle mouse events
canvas.addEventListener('mousedown', (e) => {
    const { offsetX, offsetY } = e;
    const row = Math.floor(offsetY / CELL_SIZE);
    const col = Math.floor(offsetX / CELL_SIZE);
    const node = grid[row][col];

    if (!startNode) {
        startNode = node;
        startNode.isStart = true;
        startNode.draw('blue');
    } else if (!endNode) {
        endNode = node;
        endNode.isEnd = true;
        endNode.draw('grey');
    }
});

// Start search button
document.getElementById('startSearch').addEventListener('click', () => {
    if (startNode && endNode) {
        aStar();
    }
});

// Generate maze button
document.getElementById('generateMaze').addEventListener('click', () => {
    generateMaze();
});

// Clear maze button
document.getElementById('clearMaze').addEventListener('click', () => {
    startNode = null;
    endNode = null;
    initGrid();
});

// Initialize the grid on load
initGrid();
