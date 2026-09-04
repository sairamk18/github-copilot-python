(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SudokuLeaderboard = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const STORAGE_KEY = 'sudokuTop10';
  const MAX_ENTRIES = 10;

  function read(storage) {
    try {
      const value = storage.getItem(STORAGE_KEY);
      const entries = value ? JSON.parse(value) : [];
      return Array.isArray(entries) ? entries : [];
    } catch (error) {
      return [];
    }
  }

  function write(storage, entries) {
    storage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function addEntry(storage, entry) {
    const entries = read(storage)
      .concat({
        name: entry.name.trim(),
        timeSeconds: Number(entry.timeSeconds),
        difficulty: entry.difficulty,
        hintsUsed: 0,
      })
      .filter((item) => item.name && Number.isFinite(item.timeSeconds))
      .sort((left, right) => left.timeSeconds - right.timeSeconds)
      .slice(0, MAX_ENTRIES);
    write(storage, entries);
    return entries;
  }

  return { STORAGE_KEY, addEntry, read };
});
