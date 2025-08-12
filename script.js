function openApp(id) {
  const app = document.getElementById(id);
  app.style.display = 'block';
  app.style.left = '100px';
  app.style.top = '100px';
}

function closeApp(id) {
  document.getElementById(id).style.display = 'none';
}

// Dragging
let offsetX, offsetY, draggedWindow = null;
function startDrag(e, windowEl) {
  draggedWindow = windowEl;
  offsetX = e.clientX - windowEl.offsetLeft;
  offsetY = e.clientY - windowEl.offsetTop;
  document.onmousemove = dragWindow;
  document.onmouseup = stopDrag;
}
function dragWindow(e) {
  if (!draggedWindow) return;
  draggedWindow.style.left = (e.clientX - offsetX) + 'px';
  draggedWindow.style.top = (e.clientY - offsetY) + 'px';
}
function stopDrag() {
  draggedWindow = null;
  document.onmousemove = null;
  document.onmouseup = null;
}

// Clock
setInterval(() => {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString();
}, 1000);

// Snake
let snake, direction, food, score, snakeInterval;
const snakeCanvas = document.getElementById("snakeCanvas");
const ctx = snakeCanvas.getContext("2d");

function startSnake() {
  document.getElementById("snakeGameOver").style.display = "none";
  document.getElementById("snakeStartBtn").style.display = "none";
  score = 0;
  snake = [{x: 100, y: 100}];
  direction = {x: 20, y: 0};
  placeFood();
  snakeInterval = setInterval(updateSnake, 200);
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * 10) * 20,
    y: Math.floor(Math.random() * 10) * 20
  };
}

function updateSnake() {
  let head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

  // Wall collision
  if (head.x < 0 || head.y < 0 || head.x >= snakeCanvas.width || head.y >= snakeCanvas.height) {
    return endSnake();
  }

  // Self collision
  for (let part of snake) {
    if (head.x === part.x && head.y === part.y) return endSnake();
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("snakeScore").textContent = "Score: " + score;
    placeFood();
  } else {
    snake.pop();
  }

  ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  ctx.fillStyle = "green";
  snake.forEach(part => ctx.fillRect(part.x, part.y, 20, 20));
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 20, 20);
}

function endSnake() {
  clearInterval(snakeInterval);
  document.getElementById("snakeGameOver").style.display = "block";
}

// Minesweeper
const size = 8, mineCount = 10;
let mineGrid = [];

function initMinesweeper() {
  mineGrid = [];
  const board = document.getElementById("mineBoard");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${size}, 30px)`;

  // Create cells
  for (let y = 0; y < size; y++) {
    mineGrid[y] = [];
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.oncontextmenu = e => { e.preventDefault(); toggleFlag(cell); };
      cell.onclick = () => revealCell(x, y);
      mineGrid[y][x] = {mine: false, revealed: false, flagged: false, element: cell};
      board.appendChild(cell);
    }
  }

  // Place mines
  let placed = 0;
  while (placed < mineCount) {
    let rx = Math.floor(Math.random() * size);
    let ry = Math.floor(Math.random() * size);
    if (!mineGrid[ry][rx].mine) {
      mineGrid[ry][rx].mine = true;
      placed++;
    }
  }
}

function toggleFlag(cell) {
  const x = cell.dataset.x, y = cell.dataset.y;
  let tile = mineGrid[y][x];
  if (tile.revealed) return;
  tile.flagged = !tile.flagged;
  cell.textContent = tile.flagged ? "🚩" : "";
}

function revealCell(x, y) {
  let tile = mineGrid[y][x];
  if (tile.revealed || tile.flagged) return;
  tile.revealed = true;
  tile.element.classList.add("revealed");

  if (tile.mine) {
    tile.element.textContent = "💣";
    document.getElementById("mineStatus").textContent = "Game Over!";
    revealAllMines();
    return;
  }

  let minesAround = countMines(x, y);
  if (minesAround > 0) {
    tile.element.textContent = minesAround;
  } else {
    for (let ny = y - 1; ny <= y + 1; ny++) {
      for (let nx = x - 1; nx <= x + 1; nx++) {
        if (nx >= 0 && ny >= 0 && nx < size && ny < size) {
          revealCell(nx, ny);
        }
      }
    }
  }
}

function countMines(x, y) {
  let count = 0;
  for (let ny = y - 1; ny <= y + 1; ny++) {
    for (let nx = x - 1; nx <= x + 1; nx++) {
      if (nx >= 0 && ny >= 0 && nx < size && ny < size) {
        if (mineGrid[ny][nx].mine) count++;
      }
    }
  }
  return count;
}

function revealAllMines() {
  for (let row of mineGrid) {
    for (let cell of row) {
      if (cell.mine) {
        cell.element.textContent = "💣";
        cell.element.classList.add("revealed");
      }
    }
  }
}

// Init Minesweeper on load
initMinesweeper();
