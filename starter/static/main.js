// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let selectedDifficulty = 'Medium';
let timerId = null;
let startedAt = null;
let elapsedSeconds = 0;
let gameCompleted = false;
let hintsUsed = 0;
const THEME_STORAGE_KEY = 'sudokuTheme';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function updateTimer() {
  elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  document.getElementById('timer').innerText = formatTime(elapsedSeconds);
}

function startTimer() {
  stopTimer();
  startedAt = Date.now();
  elapsedSeconds = 0;
  gameCompleted = false;
  document.getElementById('timer').innerText = formatTime(elapsedSeconds);
  timerId = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  SudokuLeaderboard.read(localStorage).forEach((entry) => {
    const item = document.createElement('li');
    item.innerText = `${entry.name} - ${formatTime(entry.timeSeconds)} `
      + `(${entry.difficulty}, hints: ${entry.hintsUsed})`;
    list.appendChild(item);
  });
}

function getBoard() {
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => {
      const value = inputs[row * SIZE + col].value;
      return value ? parseInt(value, 10) : 0;
    }),
  );
}

function setMessage(text, type = '') {
  const message = document.getElementById('message');
  message.innerText = text;
  message.className = type;
}

function updateHintsDisplay() {
  document.getElementById('hints-used').innerText = hintsUsed;
}

function markInput(input, incorrect) {
  input.classList.remove('incorrect', 'correct');
  input.setAttribute('aria-invalid', String(incorrect));
  if (incorrect) {
    input.classList.add('incorrect');
  } else if (input.value) {
    input.classList.add('correct');
  }
}

async function checkInput(input) {
  if (!input.value) {
    markInput(input, false);
    return;
  }
  const data = await checkBoard(getBoard());
  const key = `${input.dataset.row},${input.dataset.col}`;
  markInput(input, new Set(data.incorrect.map(([row, col]) => `${row},${col}`)).has(key));
}

async function checkBoard(board) {
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board}),
  });
  return res.json();
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const isDark = theme === 'dark';
  const toggle = document.getElementById('toggle-theme');
  toggle.innerText = isDark ? 'Light mode' : 'Dark mode';
  toggle.setAttribute('aria-pressed', String(isDark));
}

function initializeTheme() {
  applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'light');
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.setAttribute('aria-label', `Row ${i + 1}, column ${j + 1}`);
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  selectedDifficulty = data.difficulty || difficulty;
  hintsUsed = 0;
  updateHintsDisplay();
  startTimer();
  setMessage('');
}

async function checkSolution() {
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  const data = await checkBoard(getBoard());
  if (data.error) {
    setMessage(data.error, 'error');
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    markInput(inp, incorrect.has(idx));
  }
  if (data.complete) {
    if (gameCompleted) return;
    stopTimer();
    gameCompleted = true;
    setMessage('Congratulations! You solved it!', 'success');
    document.getElementById('completed-time').innerText = formatTime(elapsedSeconds);
    document.getElementById('score-dialog').showModal();
  } else {
    setMessage(
      incorrect.size ? 'Some cells are incorrect.' : 'Keep going: complete every cell.',
      'error',
    );
  }
}

async function useHint() {
  if (gameCompleted) return;
  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board: getBoard()}),
  });
  const data = await res.json();
  if (data.error) {
    setMessage(data.error, 'error');
    return;
  }
  const input = document.getElementById('sudoku-board').getElementsByTagName('input')
    [data.row * SIZE + data.col];
  input.value = data.value;
  input.disabled = true;
  input.classList.add('hinted');
  hintsUsed += 1;
  updateHintsDisplay();
  setMessage('A correct value was revealed.', 'success');
}

function saveScore(event) {
  event.preventDefault();
  const name = document.getElementById('player-name').value.trim();
  if (!name) return;
  SudokuLeaderboard.addEntry(localStorage, {
    name,
    timeSeconds: elapsedSeconds,
    difficulty: selectedDifficulty,
    hintsUsed,
  });
  document.getElementById('score-dialog').close();
  document.getElementById('score-form').reset();
  renderLeaderboard();
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', useHint);
  document.getElementById('toggle-theme').addEventListener('click', () => {
    const theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  });
  document.getElementById('show-leaderboard').addEventListener('click', () => {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.hidden = !leaderboard.hidden;
    if (!leaderboard.hidden) renderLeaderboard();
  });
  document.getElementById('score-form').addEventListener('submit', saveScore);
  renderLeaderboard();
  initializeTheme();
  // initialize
  newGame();
});