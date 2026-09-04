import random

import pytest

from starter import sudoku_logic


@pytest.fixture
def deterministic_randomness():
    state = random.getstate()
    random.seed(12345)
    yield
    random.setstate(state)


def assert_valid_solution(board):
    expected = set(range(1, sudoku_logic.SIZE + 1))

    assert all(set(row) == expected for row in board)
    assert all(
        {board[row][column] for row in range(sudoku_logic.SIZE)} == expected
        for column in range(sudoku_logic.SIZE)
    )
    assert all(
        {
            board[row][column]
            for row in range(box_row, box_row + 3)
            for column in range(box_column, box_column + 3)
        }
        == expected
        for box_row in range(0, sudoku_logic.SIZE, 3)
        for box_column in range(0, sudoku_logic.SIZE, 3)
    )


def test_create_empty_board_has_expected_shape_and_values():
    board = sudoku_logic.create_empty_board()

    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_is_safe_rejects_row_column_and_box_conflicts():
    board = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ]

    assert sudoku_logic.is_safe(board, 0, 2, 4)
    assert not sudoku_logic.is_safe(board, 0, 2, 5)
    assert not sudoku_logic.is_safe(board, 0, 2, 6)
    assert not sudoku_logic.is_safe(board, 0, 2, 9)


def test_fill_board_creates_a_complete_valid_solution(deterministic_randomness):
    board = sudoku_logic.create_empty_board()

    assert sudoku_logic.fill_board(board)
    assert_valid_solution(board)


def test_generate_puzzle_has_requested_number_of_clues(deterministic_randomness):
    clues = 40

    puzzle, solution = sudoku_logic.generate_puzzle(clues)

    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == clues
    assert_valid_solution(solution)
    assert all(
        puzzle[row][column] in (sudoku_logic.EMPTY, solution[row][column])
        for row in range(sudoku_logic.SIZE)
        for column in range(sudoku_logic.SIZE)
    )
