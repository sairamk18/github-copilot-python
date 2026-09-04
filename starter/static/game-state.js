(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SudokuGameState = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function isIncorrectValue(value, correctValue) {
    return value !== '' && Number(value) !== correctValue;
  }

  function findConflicts(board) {
    const size = board.length;
    const conflicts = new Set();
    const addConflict = (row1, col1, row2, col2) => {
      conflicts.add(`${row1},${col1}`);
      conflicts.add(`${row2},${col2}`);
    };

    for (let row = 0; row < size; row += 1) {
      for (let col1 = 0; col1 < size; col1 += 1) {
        if (!board[row][col1]) continue;
        for (let col2 = col1 + 1; col2 < size; col2 += 1) {
          if (board[row][col1] === board[row][col2]) {
            addConflict(row, col1, row, col2);
          }
        }
      }
    }

    for (let col = 0; col < size; col += 1) {
      for (let row1 = 0; row1 < size; row1 += 1) {
        if (!board[row1][col]) continue;
        for (let row2 = row1 + 1; row2 < size; row2 += 1) {
          if (board[row1][col] === board[row2][col]) {
            addConflict(row1, col, row2, col);
          }
        }
      }
    }

    const boxSize = Math.sqrt(size);
    for (let boxRow = 0; boxRow < size; boxRow += boxSize) {
      for (let boxCol = 0; boxCol < size; boxCol += boxSize) {
        for (let row1 = boxRow; row1 < boxRow + boxSize; row1 += 1) {
          for (let col1 = boxCol; col1 < boxCol + boxSize; col1 += 1) {
            if (!board[row1][col1]) continue;
            for (let row2 = boxRow; row2 < boxRow + boxSize; row2 += 1) {
              for (let col2 = boxCol; col2 < boxCol + boxSize; col2 += 1) {
                if ((row1 !== row2 || col1 !== col2) &&
                    board[row1][col1] === board[row2][col2]) {
                  addConflict(row1, col1, row2, col2);
                }
              }
            }
          }
        }
      }
    }

    return conflicts;
  }

  function findHintCell(puzzle, board, solution) {
    for (let row = 0; row < puzzle.length; row += 1) {
      for (let col = 0; col < puzzle[row].length; col += 1) {
        if (puzzle[row][col] === 0 && !board[row][col]) {
          return { row, col, value: solution[row][col] };
        }
      }
    }
    return null;
  }

  return { findConflicts, findHintCell, isIncorrectValue };
});
