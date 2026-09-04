import copy
import random

SIZE = 9
EMPTY = 0
MAX_GENERATION_ATTEMPTS = 100
DIFFICULTY_CLUES = {
    "Easy": 45,
    "Medium": 35,
    "Hard": 25,
}

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def _find_empty_cell(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None


def _is_complete_valid_board(board):
    expected = set(range(1, SIZE + 1))
    return (
        all(set(row) == expected for row in board)
        and all(
            {board[row][col] for row in range(SIZE)} == expected
            for col in range(SIZE)
        )
        and all(
            {
                board[row][col]
                for row in range(box_row, box_row + 3)
                for col in range(box_col, box_col + 3)
            }
            == expected
            for box_row in range(0, SIZE, 3)
            for box_col in range(0, SIZE, 3)
        )
    )


def count_solutions(board, limit=2):
    """Count solutions, stopping when the requested limit is reached."""
    empty_cell = _find_empty_cell(board)
    if empty_cell is None:
        return 1 if _is_complete_valid_board(board) else 0

    row, col = empty_cell
    solution_count = 0
    for candidate in range(1, SIZE + 1):
        if is_safe(board, row, col, candidate):
            board[row][col] = candidate
            solution_count += count_solutions(board, limit)
            board[row][col] = EMPTY
            if solution_count >= limit:
                return solution_count
    return solution_count


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def remove_cells(board, clues):
    """Remove cells while preserving a unique solution when possible."""
    cells = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    while sum(cell != EMPTY for row in board for cell in row) > clues:
        random.shuffle(cells)
        removed = False
        for row, col in cells:
            if board[row][col] == EMPTY:
                continue
            value = board[row][col]
            board[row][col] = EMPTY
            if count_solutions(board, limit=2) == 1:
                removed = True
                break
            board[row][col] = value
        if not removed:
            break
    return board


def generate_puzzle(clues=35):
    if not 1 <= clues <= SIZE * SIZE:
        raise ValueError("clues must be between 1 and 81")

    for _ in range(MAX_GENERATION_ATTEMPTS):
        solution = create_empty_board()
        fill_board(solution)
        puzzle = deep_copy(solution)
        remove_cells(puzzle, clues)
        if sum(cell != EMPTY for row in puzzle for cell in row) == clues:
            return puzzle, solution

    raise RuntimeError("Unable to generate a puzzle with the requested clue count")


def generate_puzzle_for_difficulty(difficulty):
    """Generate a uniquely solvable puzzle for a named difficulty level."""
    try:
        clues = DIFFICULTY_CLUES[difficulty]
    except KeyError as error:
        raise ValueError(
            f"Unsupported difficulty: {difficulty}. "
            f"Choose one of {', '.join(DIFFICULTY_CLUES)}."
        ) from error
    return generate_puzzle(clues)
