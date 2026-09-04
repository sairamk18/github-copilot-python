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

  return { findHintCell, isIncorrectValue };
});
