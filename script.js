/* ===========================
   Taskbar/Window utilities
   =========================== */
const taskbarApps = document.getElementById('taskbar-apps');
let highestZ = 10;
let dragData = null;

function bringToFront(element) {
  highestZ++;
  element.style.zIndex = highestZ;
}

function addTaskbarButton(id) {
  if (document.getElementById('taskbar-btn-' + id)) return;
  const btn = document.createElement('button');
  btn.id = 'taskbar-btn-' + id;
  const appNames = { 'minesweeper-app': 'Minesweeper', 'snake-app': 'Snake' };
  btn.textContent = appNames[id] || id.replace('-app', '');
  btn.onclick = () => toggleApp(id);
  taskbarApps.appendChild(btn);
}
function removeTaskbarButton(id) {
  const btn = document.getElementById('taskbar-btn-' + id);
  if (btn) btn.remove();
}

function openApp(id) {
  const app = document.getElementById(id);
  if (!app) return;
  app.style.display = 'block';
  addTaskbarButton(id);
  bringToFront(app);
  if (id === 'snake-app') snake_updateHUDFromStorage();
}
function closeApp(id) {
  const app = document.getElementById(id);
  if (!app) return;
  app.style.display = 'none';
  removeTaskbarButton(id);
  if (id === 'snake-app') snake_stop();
}
function toggleApp(id) {
  const app = document.getElementById(id);
  if (!app) return;
  if (app.style.display === 'block') {
    closeApp(id);
  } else {
    openApp(id);
  }
}

/* Draggable windows */
function startDrag(e, element) {
  dragData = {
    offsetX: e.clientX - element.offsetLeft,
    offsetY: e.clientY - element.offsetTop,
    element
  };
  bringToFront(element);
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
}
function dragMove(e) {
  if (!dragData) return;
  dragData.element.style.left = Math.max(0, e.clientX - dragData.offsetX) + 'px';
  dragData.element.style.top  = Math.max(0, e.clientY - dragData.offsetY) + 'px';
}
function dragEnd() {
  dragData = null;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
}

/* Clock */
setInterval(() => {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString();
}, 1000);

/* =====================================
   Minesweeper (namespaced)
   ===================================== */
const mines_rows = 10;
const mines_cols = 10;
const mines_mineCount = 15;

let mines_board = [];
let mines_firstClick = true;
let mines_gameOver = false;

function mines_initBoard() {
  const container = document.getElementById('minesweeper');
  const status = document.getElementById('minesweeper-status');
  if (!container) return;
  container.innerHTML = '';
  status.textContent = '';
  mines_board = [];
  mines_firstClick = true;
  mines_gameOver = false;

  for (let r = 0; r < mines_rows; r++) {
    let row = [];
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    for (let c = 0; c < mines_cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', mines_onCellClick);

      rowDiv.appendChild(cell);
      row.push({ mine: false, revealed: false, number: 0, element: cell });
    }

    container.appendChild(rowDiv);
    mines_board.push(row);
  }
}

function mines_placeMinesAvoidingFirstClick(safeRow, safeCol) {
  let placed = 0;
  while (placed < mines_mineCount) {
    let r = Math.floor(Math.random() * mines_rows);
    let c = Math.floor(Math.random() * mines_cols);
    if ((r !== safeRow || c !== safeCol) && !mines_board[r][c].mine) {
      mines_board[r][c].mine = true;
      placed++;
    }
  }
}
function mines_calculateNumbers() {
  const directions = [
    [-1,-1],[-1,0],[-1,1],
    [0,-1],        [0,1],
    [1,-1],[1,0],[1,1]
  ];
  for (let r = 0; r < mines_rows; r++) {
    for (let c = 0; c < mines_cols; c++) {
      if (mines_board[r][c].mine) continue;
      let count = 0;
      directions.forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < mines_rows && nc >= 0 && nc < mines_cols && mines_board[nr][nc].mine) {
          count++;
        }
      });
      mines_board[r][c].number = count;
    }
  }
}
function mines_onCellClick(e) {
  if (mines_gameOver) return;
  const r = +e.target.dataset.row;
  const c = +e.target.dataset.col;

  if (mines_firstClick) {
    mines_placeMinesAvoidingFirstClick(r, c);
    mines_calculateNumbers();
    mines_firstClick = false;
  }
  mines_revealCell(r, c);
  mines_checkWin();
}
function mines_revealCell(r, c) {
  const cell = mines_board[r][c];
  if (cell.revealed) return;

  cell.revealed = true;
  cell.element.classList.add('revealed');

  if (cell.mine) {
    cell.element.classList.add('mine');
    mines_endGame(false);
    return;
  }

  if (cell.number > 0) {
    cell.element.textContent = cell.number;
  } else {
    const directions = [
      [-1,-1],[-1,0],[-1,1],
      [0,-1],        [0,1],
      [1,-1],[1,0],[1,1]
    ];
    directions.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < mines_rows && nc >= 0 && nc < mines_cols) {
        mines_revealCell(nr, nc);
      }
    });
  }
}
function mines_endGame(won) {
  mines_gameOver = true;
  const msg = document.getElementById('minesweeper-status');
  msg.textContent = won ? 'You Win!' : 'Game Over!';
  if (!won) {
    for (let r = 0; r < mines_rows; r++) {
      for (let c = 0; c < mines_cols; c++) {
        if (mines_board[r][c].mine) {
          mines_board[r][c].element.classList.add('mine');
        }
      }
    }
  }
}
function mines_checkWin() {
  let revealed = 0;
  for (let r = 0; r < mines_rows; r++) {
    for (let c = 0; c < mines_cols; c++) {
      if (mines_board[r][c].revealed) revealed++;
    }
  }
  if (revealed === mines_rows * mines_cols - mines_mineCount) {
    mines_endGame(true);
  }
}

/* Initialize minesweeper on load */
mines_initBoard();

/* ===========================
   Snake (namespaced)
   =========================== */
const snake_canvas = document.getElementById('snake-canvas');
const snake_ctx = snake_canvas ? snake_canvas.getContext('2d') : null;
const snake_grid = 20; // px
const snake_tiles = snake_canvas ? snake_canvas.width / snake_grid : 12;

let snake_body = [];
let snake_food = { x: 0, y: 0 };
let snake_dir = null;
let snake_interval = null;
let snake_score = 0;
let snake_high = 0;
let snake_running = false;

function snake_updateHUDFromStorage() {
  snake_high = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
  const highEl = document.getElementById('snake-highscore');
  if (highEl) highEl.textContent = snake_high;
  const scoreEl = document.getElementById('snake-score');
  if (scoreEl) scoreEl.textContent = 0;
}

function snake_start() {
  if (!snake_ctx) return;
  snake_stop(); // clear any prior loop
  snake_body = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  snake_dir = 'right';
  snake_score = 0;
  document.getElementById('snake-score').textContent = '0';
  document.getElementById('snake-status').textContent = '';
  snake_placeFood();
  snake_draw();
  snake_interval = setInterval(snake_tick, 120);
  snake_running = true;
}

function snake_stop() {
  if (snake_interval) {
    clearInterval(snake_interval);
    snake_interval = null;
  }
  snake_running = false;
}

function snake_placeFood() {
  let ok = false;
  while (!ok) {
    snake_food.x = Math.floor(Math.random() * snake_tiles);
    snake_food.y = Math.floor(Math.random() * snake_tiles);
    ok = !snake_body.some(s => s.x === snake_food.x && s.y === snake_food.y);
  }
}

function snake_draw() {
  if (!snake_ctx) return;
  snake_ctx.clearRect(0, 0, snake_canvas.width, snake_canvas.height);

  // food
  snake_ctx.fillStyle = 'red';
  snake_ctx.fillRect(snake_food.x * snake_grid, snake_food.y * snake_grid, snake_grid, snake_grid);

  // snake
  snake_ctx.fillStyle = 'green';
  snake_body.forEach((p, i) => {
    snake_ctx.fillRect(p.x * snake_grid, p.y * snake_grid, snake_grid, snake_grid);
    if (i === 0) {
      snake_ctx.strokeStyle = 'darkgreen';
      snake_ctx.lineWidth = 2;
      snake_ctx.strokeRect(p.x * snake_grid, p.y * snake_grid, snake_grid, snake_grid);
    }
  });
}

function snake_tick() {
  const head = { ...snake_body[0] };
  switch (snake_dir) {
    case 'left': head.x--; break;
    case 'right': head.x++; break;
    case 'up': head.y--; break;
    case 'down': head.y++; break;
  }

  // collisions
  if (
    head.x < 0 || head.x >= snake_tiles ||
    head.y < 0 || head.y >= snake_tiles ||
    snake_body.some(s => s.x === head.x && s.y === head.y)
  ) {
    snake_gameOver();
    return;
  }

  snake_body.unshift(head);

  // eat?
  if (head.x === snake_food.x && head.y === snake_food.y) {
    snake_score++;
    document.getElementById('snake-score').textContent = String(snake_score);
    if (snake_score > snake_high) {
      snake_high = snake_score;
      localStorage.setItem('snakeHighScore', String(snake_high));
      document.getElementById('snake-highscore').textContent = String(snake_high);
    }
    snake_placeFood();
  } else {
    snake_body.pop();
  }

  snake_draw();
}

function snake_gameOver() {
  snake_stop();
  document.getElementById('snake-status').textContent = 'Game Over! Press Start to play again.';
}

/* Keyboard controls only when running */
window.addEventListener('keydown', e => {
  if (!snake_running) return;
  const map = { ArrowLeft: 'left', ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down' };
  const newDir = map[e.key];
  if (!newDir) return;
  const opposite = { left: 'right', right: 'left', up: 'down', down: 'up' };
  if (snake_dir && newDir !== opposite[snake_dir]) {
    snake_dir = newDir;
  }
});

/* Initialize Snake HUD once (so high score shows when opening) */
snake_updateHUDFromStorage();
