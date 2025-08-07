// Window management
function openApp(id) {
  const app = document.getElementById(id);
  app.style.display = 'block';
  app.style.left = '100px';
  app.style.top = '100px';
  bringToFront(app);
}

function closeApp(id) {
  const app = document.getElementById(id);
  app.style.display = 'none';
  if (id === 'snake') {
    stopSnake();
  }
}

let highestZ = 1000;
function bringToFront(el) {
  highestZ++;
  el.style.zIndex = highestZ;
}

// Dragging logic
let offsetX, offsetY, draggedWindow = null;

function startDrag(e, windowEl) {
  draggedWindow = windowEl;
  offsetX = e.clientX - windowEl.offsetLeft;
  offsetY = e.clientY - windowEl.offsetTop;
  bringToFront(windowEl);
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

// --- Snake game ---

const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startSnakeBtn");
const scoreDisplay = document.getElementById("scoreDisplay");

// Create Play Again button dynamically
let playAgainBtn = document.createElement("button");
playAgainBtn.textContent = "Play Again?";
playAgainBtn.style.marginTop = "10px";
playAgainBtn.style.padding = "8px 16px";
playAgainBtn.style.fontSize = "16px";
playAgainBtn.style.cursor = "pointer";
playAgainBtn.style.display = "none";

const snakeWindowContent = document.querySelector("#snake .window-content");
snakeWindowContent.appendChild(playAgainBtn);

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let snakeLength = 5;
let direction = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let gameInterval = null;
let gameSpeed = 150;
let gameOver = false;
let score = 0;

startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  playAgainBtn.style.display = 'none';
  scoreDisplay.style.display = 'block';
  canvas.style.display = 'block';
  startSnake();
});

playAgainBtn.addEventListener('click', () => {
  playAgainBtn.style.display = 'none';
  scoreDisplay.style.display = 'block';
  startSnake();
});

function startSnake() {
  snake = [];
  snakeLength = 5;
  direction = { x: 1, y: 0 };
  gameOver = false;
  score = 0;
  updateScore();

  // Initialize snake in center
  for (let i = snakeLength - 1; i >= 0; i--) {
    snake.push({ x: i, y: Math.floor(tileCount / 2) });
  }

  placeFood();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);
  document.addEventListener("keydown", keyDown);
}

function stopSnake() {
  clearInterval(gameInterval);
  gameInterval = null;
  document.removeEventListener("keydown", keyDown);
  canvas.style.display = 'none';
  startBtn.style.display = 'block';
  playAgainBtn.style.display = 'none';
  scoreDisplay.style.display = 'none';
}

function placeFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);

  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    placeFood();
  }
}

function gameLoop() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  let headX = snake[0].x + direction.x;
  let headY = snake[0].y + direction.y;

  // New wall collision check — no wrapping
  if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
    gameOver = true;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  if (snake.some(segment => segment.x === headX && segment.y === headY)) {
    gameOver = true;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  snake.unshift({ x: headX, y: headY });

  if (headX === food.x && headY === food.y) {
    snakeLength++;
    score++;
    updateScore();
    placeFood();
  }

  while (snake.length > snakeLength) {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  snake.forEach((segment) => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function drawGameOver() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  ctx.font = "30px Tahoma";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

  playAgainBtn.style.display = "inline-block";
  scoreDisplay.style.display = "none";
}

function updateScore() {
  scoreDisplay.textContent = "Score: " + score;
}

function keyDown(e) {
  if (gameOver) return;

  switch (e.code) {
    case "ArrowUp":
      if (direction.y !== 1) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y !== -1) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x !== 1) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x !== -1) direction = { x: 1, y: 0 };
      break;
  }
}
