const assert = require('node:assert/strict');
const test = require('node:test');
const { addEntry, read, STORAGE_KEY } = require('../starter/static/leaderboard.js');

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('leaderboard sorts scores and keeps only the ten fastest', () => {
  const browserStorage = storage();
  for (let time = 20; time >= 1; time -= 1) {
    addEntry(browserStorage, {
      name: `Player ${time}`,
      timeSeconds: time,
      difficulty: 'Medium',
    });
  }

  const entries = read(browserStorage);
  assert.equal(entries.length, 10);
  assert.deepEqual(entries.map((entry) => entry.timeSeconds), [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);
  assert.equal(entries[0].hintsUsed, 0);
});

test('leaderboard data can be read back from storage', () => {
  const browserStorage = storage();
  addEntry(browserStorage, {
    name: 'Ada',
    timeSeconds: 42,
    difficulty: 'Hard',
  });

  assert.equal(JSON.parse(browserStorage.getItem(STORAGE_KEY))[0].name, 'Ada');
});

test('leaderboard preserves the number of hints used', () => {
  const browserStorage = storage();
  addEntry(browserStorage, {
    name: 'Grace',
    timeSeconds: 30,
    difficulty: 'Easy',
    hintsUsed: 3,
  });

  assert.equal(read(browserStorage)[0].hintsUsed, 3);
});
