"use client";

import { useMemo, useState } from "react";
import { generateWordSearchHtml } from "@/lib/htmlGenerators";
import { wordSearchWords } from "@/lib/phonemes";

const size = 10;
const filler = ["p", "t", "k", "b", "d", "g", "m", "n", "ŋ", "f", "s", "θ", "ʃ", "v", "z", "ɹ", "æ", "ɪ", "ɐ", "tʃ", "dʒ"];

type Position = { row: number; col: number };

type PlacedWord = {
  start: Position;
  end: Position;
};

function getDirections(difficulty: string) {
  if (difficulty === "Easy") return [{ row: 0, col: 1 }];
  if (difficulty === "Medium") return [{ row: 0, col: 1 }, { row: 1, col: 0 }];

  return [
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: 0, col: -1 },
    { row: -1, col: 0 },
    { row: -1, col: -1 },
    { row: -1, col: 1 },
  ];
}

function canPlace(grid: string[][], symbols: string[], start: Position, direction: Position) {
  for (let i = 0; i < symbols.length; i++) {
    const row = start.row + direction.row * i;
    const col = start.col + direction.col * i;

    if (row < 0 || row >= size || col < 0 || col >= size) return false;
    if (grid[row][col] !== "" && grid[row][col] !== symbols[i]) return false;
  }

  return true;
}

function makeGrid(difficulty: string) {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed: PlacedWord[] = [];
  const directions = getDirections(difficulty);

  wordSearchWords.forEach((word) => {
    let found = false;

    for (let attempt = 0; attempt < 200 && !found; attempt++) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const start = {
        row: Math.floor(Math.random() * size),
        col: Math.floor(Math.random() * size),
      };

      if (canPlace(grid, word.symbols, start, direction)) {
        word.symbols.forEach((symbol, i) => {
          const row = start.row + direction.row * i;
          const col = start.col + direction.col * i;
          grid[row][col] = symbol;
        });

        const end = {
          row: start.row + direction.row * (word.symbols.length - 1),
          col: start.col + direction.col * (word.symbols.length - 1),
        };

        placed.push({ start, end });
        found = true;
      }
    }
  });

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!grid[row][col]) {
        grid[row][col] = filler[Math.floor(Math.random() * filler.length)];
      }
    }
  }

  return { grid, placed };
}

function getPath(start: Position, end: Position) {
  const rowDifference = end.row - start.row;
  const colDifference = end.col - start.col;

  const straight = rowDifference === 0 || colDifference === 0 || Math.abs(rowDifference) === Math.abs(colDifference);
  if (!straight) return null;

  const steps = Math.max(Math.abs(rowDifference), Math.abs(colDifference));
  const stepRow = rowDifference === 0 ? 0 : rowDifference / steps;
  const stepCol = colDifference === 0 ? 0 : colDifference / steps;

  const path: Position[] = [];
  for (let i = 0; i <= steps; i++) {
    path.push({
      row: start.row + stepRow * i,
      col: start.col + stepCol * i,
    });
  }

  return path;
}

export default function WordSearchPage() {
  const [difficulty, setDifficulty] = useState("Easy");
  const [game, setGame] = useState(() => makeGrid("Easy"));
  const [startCell, setStartCell] = useState<Position | null>(null);
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState("Click the first and last cell of a word.");

  const foundPositions = useMemo(() => {
    const positions: string[] = [];

    wordSearchWords.forEach((word, index) => {
      if (!found.includes(word.english)) return;
      const placed = game.placed[index];
      if (!placed) return;

      const path = getPath(placed.start, placed.end) || [];
      path.forEach((cell) => positions.push(`${cell.row}-${cell.col}`));
    });

    return positions;
  }, [found, game.placed]);

  function newGrid(value = difficulty) {
    setDifficulty(value);
    setGame(makeGrid(value));
    setStartCell(null);
    setSelectedCells([]);
    setFound([]);
    setMessage("Click the first and last cell of a word.");
  }

  function checkSelection(endCell: Position) {
    if (!startCell) {
      setStartCell(endCell);
      setSelectedCells([endCell]);
      setMessage("Now click the last cell of the word.");
      return;
    }

    const path = getPath(startCell, endCell);

    if (!path) {
      setStartCell(null);
      setSelectedCells([]);
      setMessage("Please choose a straight line: across, down or diagonal.");
      return;
    }

    const selectedWord = path.map((cell) => game.grid[cell.row][cell.col]).join("|");
    const reverseWord = [...path].reverse().map((cell) => game.grid[cell.row][cell.col]).join("|");

    let foundWord = "";
    wordSearchWords.forEach((word) => {
      const target = word.symbols.join("|");
      if (target === selectedWord || target === reverseWord) foundWord = word.english;
    });

    if (foundWord) {
      if (!found.includes(foundWord)) {
        const newFound = [...found, foundWord];
        setFound(newFound);
        setMessage(newFound.length === wordSearchWords.length ? "Great! You found all five words." : `Found ${foundWord}. Keep going!`);
      } else {
        setMessage("You already found that word.");
      }
    } else {
      setMessage("That selection is not one of the words.");
    }

    setStartCell(null);
    setSelectedCells([]);
  }

  return (
    <div className="page">
      <div className="word-search-layout">
        <section className="panel">
          <h1>Word Search Builder</h1>
          <p className="small">Assessment 1 uses a fixed list of five phoneme words.</p>

          <div className="field">
            <label htmlFor="difficulty-search">Difficulty</label>
            <select
              id="difficulty-search"
              value={difficulty}
              onChange={(e) => newGrid(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="button-row">
            <button className="primary" onClick={() => newGrid()}>New Preview Grid</button>
            <button className="secondary" onClick={() => generateWordSearchHtml(difficulty)}>Generate HTML</button>
          </div>

          <div className="info-box">
            <strong>How to play:</strong>
            <p className="small" style={{ marginBottom: 0 }}>
              Click the first phoneme and then the last phoneme of a word. Words can be found forwards or backwards depending on the difficulty.
            </p>
          </div>

          {message && <div className="message" role="status">{message}</div>}
        </section>

        <section className="panel">
          <h2>Preview</h2>
          <div className="search-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }} aria-label="Word Search grid">
            {game.grid.flatMap((row, rowIndex) => row.map((cell, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              const selected = selectedCells.some((item) => item.row === rowIndex && item.col === colIndex);
              const foundCell = foundPositions.includes(key);

              return (
                <button
                  key={key}
                  type="button"
                  className={`search-cell ${selected ? "selected" : ""} ${foundCell ? "found" : ""}`}
                  onClick={() => checkSelection({ row: rowIndex, col: colIndex })}
                  aria-label={`row ${rowIndex + 1}, column ${colIndex + 1}, ${cell}`}
                >
                  {cell}
                </button>
              );
            }))}
          </div>

          <h3>Words to find</h3>
          <div className="word-list">
            {wordSearchWords.map((word) => (
              <div key={word.english} className={`word-chip ${found.includes(word.english) ? "found" : ""}`}>
                /{word.symbols.join(" ")}/
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
