async function fetchWordleSolution() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const url = `https://cors.samj.app/?destination=https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.solution;
  } catch (error) {
    console.error('Error fetching the Wordle solution:', error);
    alert('Error fetching the Wordle solution. Please try again later.');
    return null;
  }
}

const state = {
  secret: '',
  grid: Array(6)
    .fill()
    .map(() => Array(5).fill('')),
  currentRow: 0,
  currentCol: 0,
};

function drawGrid(container) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      drawBox(grid, i, j);
    }
  }

  container.appendChild(grid);
}

function updateGrid() {
  for (let i = 0; i < state.grid.length; i++) {
    for (let j = 0; j < state.grid[i].length; j++) {
      const box = document.getElementById(`box${i}${j}`);
      box.textContent = state.grid[i][j];
    }
  }
}

function drawBox(container, row, col, letter = '') {
  const box = document.createElement('div');
  box.className = 'box';
  box.textContent = letter;
  box.id = `box${row}${col}`;

  container.appendChild(box);
  return box;
}

function registerKeyboardEvents() {
  document.body.onkeydown = (e) => {
    handleKey(e.key);
  };
}

function handleKey(key) {
  if (key === 'Enter') {
    if (state.currentCol === 5) {
      const word = getCurrentWord();
      if (isWordValid(word)) {
        revealWord(word);
        state.currentRow++;
        state.currentCol = 0;
      } else {
        alert('Not a valid word.');
      }
    }
  }
  if (key === 'Backspace') {
    removeLetter();
  }
  if (isLetter(key)) {
    addLetter(key);
  }

  updateGrid();
}

function getCurrentWord() {
  return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function isWordValid(word) {
  // Here, we assume the word is valid if it is 5 letters long
  // In a real implementation, you might want to check against a dictionary of valid words
  return word.length === 5;
}

function getNumOfOccurrencesInWord(word, letter) {
  let result = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === letter) {
      result++;
    }
  }
  return result;
}

function getPositionOfOccurrence(word, letter, position) {
  let result = 0;
  for (let i = 0; i <= position; i++) {
    if (word[i] === letter) {
      result++;
    }
  }
  return result;
}

function revealWord(guess) {
  const row = state.currentRow;
  const animation_duration = 500; // ms

  for (let i = 0; i < 5; i++) {
    const box = document.getElementById(`box${row}${i}`);
    const letter = box.textContent;
    const numOfOccurrencesSecret = getNumOfOccurrencesInWord(state.secret, letter);
    const numOfOccurrencesGuess = getNumOfOccurrencesInWord(guess, letter);
    const letterPosition = getPositionOfOccurrence(guess, letter, i);

    setTimeout(() => {
      if (numOfOccurrencesGuess > numOfOccurrencesSecret && letterPosition > numOfOccurrencesSecret) {
        box.classList.add('empty');
        updateVirtualKeyboard(letter, 'empty');
      } else {
        if (letter === state.secret[i]) {
          box.classList.add('right');
          updateVirtualKeyboard(letter, 'right');
        } else if (state.secret.includes(letter)) {
          box.classList.add('wrong');
          updateVirtualKeyboard(letter, 'wrong');
        } else {
          box.classList.add('empty');
          updateVirtualKeyboard(letter, 'empty');
        }
      }
    }, ((i + 1) * animation_duration) / 2);

    box.classList.add('animated');
    box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
  }

  const isWinner = state.secret === guess;
  const isGameOver = state.currentRow === 5;

  setTimeout(() => {
    if (isWinner) {
      alert('Congratulations!');
    } else if (isGameOver) {
      alert(`Better luck next time! The word was ${state.secret}.`);
    }
  }, 3 * animation_duration);
}

function isLetter(key) {
  return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
  if (state.currentCol === 5) return;
  state.grid[state.currentRow][state.currentCol] = letter;
  state.currentCol++;
}

function removeLetter() {
  if (state.currentCol === 0) return;
  state.grid[state.currentRow][state.currentCol - 1] = '';
  state.currentCol--;
}

function updateVirtualKeyboard(letter, status) {
  const key = document.querySelector(`.key[data-key="${letter.toLowerCase()}"]`);
  if (key) {
    key.classList.add(status);
  }
}

function drawVirtualKeyboard(container) {
  const keyboard = document.createElement('div');
  keyboard.className = 'virtual-keyboard';

  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['↵', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
  ];

  rows.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    row.forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.className = 'key';
      keyDiv.textContent = key === 'Backspace' ? '⌫' : key;
      keyDiv.dataset.key = key.toLowerCase();
      keyDiv.onclick = () => handleKey(key);
      rowDiv.appendChild(keyDiv);
    });
    keyboard.appendChild(rowDiv);
  });

  container.appendChild(keyboard);
}

function handleVirtualKeyPress(key) {
  if (key === 'Enter') {
    if (state.currentCol === 5) {
      const word = getCurrentWord();
      if (isWordValid(word)) {
        revealWord(word);
        state.currentRow++;
        state.currentCol = 0;
      } else {
        alert('Invalid word');
      }
    }
  } else if (key === 'Backspace') {
    removeLetter();
  } else {
    addLetter(key);
  }
  updateGrid();
}

async function startGame() {
  const word = await fetchWordleSolution();
  if (!word) {
    return;
  }
  state.secret = word;

  const game = document.getElementById('game');
  drawGrid(game);
  registerKeyboardEvents();

  const virtualKeyboardContainer = document.getElementById('virtual-keyboard-container');
  drawVirtualKeyboard(virtualKeyboardContainer);
}

startGame();