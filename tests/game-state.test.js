const assert = require('node:assert/strict');
const test = require('node:test');
const { findConflicts, findHintCell, isIncorrectValue } = require('../starter/static/game-state.js');

test('hint selection chooses an empty editable cell', () => {
  const puzzle = [[1, 0], [0, 2]];
  const board = [[1, 0], [0, 2]];
  const solution = [[1, 2], [3, 2]];

  assert.deepEqual(findHintCell(puzzle, board, solution), {row: 0, col: 1, value: 2});
});

test('hint selection does not choose prefilled or filled cells', () => {
  const puzzle = [[1, 0], [0, 2]];
  const board = [[1, 4], [0, 2]];
  const solution = [[1, 2], [3, 2]];

  assert.deepEqual(findHintCell(puzzle, board, solution), {row: 1, col: 0, value: 3});
});

test('empty input is not marked incorrect', () => {
  assert.equal(isIncorrectValue('', 5), false);
  assert.equal(isIncorrectValue('4', 5), true);
  assert.equal(isIncorrectValue('5', 5), false);
});


test('conflict detection finds duplicate values in a row', () => {
  const board = [
    [5, 5, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  assert.deepEqual(
    [...findConflicts(board)].sort(),
    ['0,0', '0,1']
  );
});

test('conflict detection finds duplicate values in a column', () => {
  const board = [
    [5, 0, 0, 0],
    [5, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  assert.deepEqual(
    [...findConflicts(board)].sort(),
    ['0,0', '1,0']
  );
});

test('conflict detection finds duplicate values in a 3x3 box', () => {
  const board = [
    [5, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  assert.deepEqual(
    [...findConflicts(board)].sort(),
    ['0,0', '1,1']
  );
});

test('conflict detection ignores empty cells and valid unique values', () => {
  const board = [
    [1, 2, 3, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  assert.deepEqual([...findConflicts(board)], []);
});
