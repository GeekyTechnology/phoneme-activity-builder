"use client";

import { useEffect, useMemo, useState } from "react";
import { generateWordSearchHtml } from "@/lib/htmlGenerators";

const size = 10;

const filler = [
  "p",
  "t",
  "k",
  "b",
  "d",
  "g",
  "m",
  "n",
  "ŋ",
  "f",
  "s",
  "θ",
  "ʃ",
  "v",
  "z",
  "ɹ",
  "æ",
  "ɪ",
  "ɐ",
  "tʃ",
  "dʒ",
];

type Position = {
  row: number;
  col: number;
};

type Word = {
  id: number;
  englishWord: string;
  phonemes: string[];
  hint: string | null;
};

type ActivityWord = {
  word: Word;
};

type Activity = {
  id: number;
  name: string;
  type: string;
  difficulty: string;
  showHints: boolean;
  numberOfGuesses: number;
  wordId: number | null;
  word: Word | null;
  activityWords: ActivityWord[];
};

type PlacedWord = {
  start: Position;
  end: Position;
};

function getDirections(difficulty: string) {
  if (difficulty === "EASY") {
    return [{ row: 0, col: 1 }];
  }

  if (difficulty === "MEDIUM") {
    return [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ];
  }

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

function canPlace(
  grid: string[][],
  symbols: string[],
  start: Position,
  direction: Position
) {
  for (let i = 0; i < symbols.length; i++) {
    const row = start.row + direction.row * i;
    const col = start.col + direction.col * i;

    if (
      row < 0 ||
      row >= size ||
      col < 0 ||
      col >= size
    ) {
      return false;
    }

    if (
      grid[row][col] !== "" &&
      grid[row][col] !== symbols[i]
    ) {
      return false;
    }
  }

  return true;
}

function makeGrid(words: Word[], difficulty: string) {
  const grid = Array.from(
    { length: size },
    () => Array(size).fill("")
  );

  const placed: PlacedWord[] = [];
  const directions = getDirections(difficulty);

  words.forEach((word) => {
    let found = false;

    for (let attempt = 0; attempt < 200 && !found; attempt++) {
      const direction =
        directions[
          Math.floor(Math.random() * directions.length)
        ];

      const start = {
        row: Math.floor(Math.random() * size),
        col: Math.floor(Math.random() * size),
      };

      if (
        canPlace(
          grid,
          word.phonemes,
          start,
          direction
        )
      ) {
        word.phonemes.forEach((symbol, i) => {
          const row =
            start.row + direction.row * i;

          const col =
            start.col + direction.col * i;

          grid[row][col] = symbol;
        });

        const end = {
          row:
            start.row +
            direction.row *
              (word.phonemes.length - 1),
          col:
            start.col +
            direction.col *
              (word.phonemes.length - 1),
        };

        placed.push({
          start,
          end,
        });

        found = true;
      }
    }
  });

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!grid[row][col]) {
        grid[row][col] =
          filler[
            Math.floor(Math.random() * filler.length)
          ];
      }
    }
  }

  return {
    grid,
    placed,
  };
}

function getPath(start: Position, end: Position) {
  const rowDifference = end.row - start.row;
  const colDifference = end.col - start.col;

  const straight =
    rowDifference === 0 ||
    colDifference === 0 ||
    Math.abs(rowDifference) ===
      Math.abs(colDifference);

  if (!straight) {
    return null;
  }

  const steps = Math.max(
    Math.abs(rowDifference),
    Math.abs(colDifference)
  );

  const stepRow =
    rowDifference === 0
      ? 0
      : rowDifference / steps;

  const stepCol =
    colDifference === 0
      ? 0
      : colDifference / steps;

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
  const [activities, setActivities] = useState<Activity[]>(
    []
  );

  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [loading, setLoading] = useState(true);

  const [game, setGame] = useState<{
    grid: string[][];
    placed: PlacedWord[];
  } | null>(null);

  const [startCell, setStartCell] =
    useState<Position | null>(null);

  const [selectedCells, setSelectedCells] =
    useState<Position[]>([]);

  const [found, setFound] = useState<string[]>(
    []
  );

  const [message, setMessage] = useState(
    "Choose a saved Word Search activity."
  );

  // Load Word Search activities from the database
  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const response = await fetch(
        "/api/activities"
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Could not load activities."
        );
        return;
      }

      const wordSearchActivities =
        data.filter(
          (activity: Activity) =>
            activity.type === "WORD_SEARCH" &&
            activity.activityWords &&
            activity.activityWords.length > 0
        );

      setActivities(wordSearchActivities);

      if (wordSearchActivities.length > 0) {
        setSelectedActivity(
          wordSearchActivities[0]
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Could not load saved activities."
      );
    } finally {
      setLoading(false);
    }
  }

  // Get the actual words from the selected activity
  const words = useMemo(() => {
    if (!selectedActivity) {
      return [];
    }

    return selectedActivity.activityWords.map(
      (item) => item.word
    );
  }, [selectedActivity]);

  const difficulty =
    selectedActivity?.difficulty || "EASY";

  const foundPositions = useMemo(() => {
    const positions: string[] = [];

    if (!game) {
      return positions;
    }

    words.forEach((word, index) => {
      if (!found.includes(word.englishWord)) {
        return;
      }

      const placed = game.placed[index];

      if (!placed) {
        return;
      }

      const path =
        getPath(
          placed.start,
          placed.end
        ) || [];

      path.forEach((cell) => {
        positions.push(
          `${cell.row}-${cell.col}`
        );
      });
    });

    return positions;
  }, [found, game, words]);

  function newGrid() {
    if (words.length === 0) {
      setMessage(
        "This activity does not have any words."
      );
      return;
    }

    setGame(
      makeGrid(
        words,
        difficulty
      )
    );

    setStartCell(null);
    setSelectedCells([]);
    setFound([]);

    setMessage(
      "Click the first phoneme and then the last phoneme."
    );
  }

  function changeActivity(id: string) {
    const activity = activities.find(
      (item) => item.id === Number(id)
    );

    if (!activity) {
      return;
    }

    setSelectedActivity(activity);
    setGame(null);
    setStartCell(null);
    setSelectedCells([]);
    setFound([]);

    setMessage(
      "Click New Preview Grid to create the puzzle."
    );
  }

  function checkSelection(endCell: Position) {
    if (!game) {
      return;
    }

    if (!startCell) {
      setStartCell(endCell);
      setSelectedCells([endCell]);

      setMessage(
        "Now click the last cell of the word."
      );

      return;
    }

    const path = getPath(
      startCell,
      endCell
    );

    if (!path) {
      setStartCell(null);
      setSelectedCells([]);

      setMessage(
        "Please choose a straight line: across, down or diagonal."
      );

      return;
    }

    const selectedWord = path
      .map(
        (cell) =>
          game.grid[cell.row][cell.col]
      )
      .join("|");

    const reverseWord = [...path]
      .reverse()
      .map(
        (cell) =>
          game.grid[cell.row][cell.col]
      )
      .join("|");

    let foundWord = "";

    words.forEach((word) => {
      const target =
        word.phonemes.join("|");

      if (
        target === selectedWord ||
        target === reverseWord
      ) {
        foundWord =
          word.englishWord;
      }
    });

    if (foundWord) {
      if (!found.includes(foundWord)) {
        const newFound = [
          ...found,
          foundWord,
        ];

        setFound(newFound);

        if (
          newFound.length ===
          words.length
        ) {
          setMessage(
            "Great! You found all the words."
          );
        } else {
          setMessage(
            `Found ${foundWord}. Keep going!`
          );
        }
      } else {
        setMessage(
          "You already found that word."
        );
      }
    } else {
      setMessage(
        "That selection is not one of the words."
      );
    }

    setStartCell(null);
    setSelectedCells([]);
  }

  function generateHTML() {
    if (
      !selectedActivity ||
      words.length === 0
    ) {
      setMessage(
        "Please select a Word Search activity first."
      );
      return;
    }

    /*
      The old Assessment 1 generator only accepted
      the difficulty. We will update that generator
      next so it also receives these database words.
    */

   generateWordSearchHtml(
  words,
  difficulty
);
  }

  if (loading) {
    return (
      <div className="page">
        <section className="panel">
          <h1>Word Search Builder</h1>

          <p>
            Loading saved activities...
          </p>
        </section>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="page">
        <section className="panel">
          <h1>Word Search Builder</h1>

          <p>
            No saved Word Search activities
            were found.
          </p>

          <p className="small">
            Create a Word Search activity in
            Activity Management first.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="word-search-layout">

        {/* LEFT SIDE */}
        <section className="panel">
          <h1>Word Search Builder</h1>

          <p className="small">
            Choose a saved Word Search activity
            from the database.
          </p>

          <div className="field">
            <label htmlFor="activity-search">
              Saved Activity
            </label>

            <select
              id="activity-search"
              value={
                selectedActivity?.id || ""
              }
              onChange={(e) =>
                changeActivity(
                  e.target.value
                )
              }
            >
              {activities.map((activity) => (
                <option
                  key={activity.id}
                  value={activity.id}
                >
                  {activity.name}
                </option>
              ))}
            </select>
          </div>

          {selectedActivity && (
            <>
              <div className="info-box">
                <strong>
                  Activity settings
                </strong>

                <p className="small">
                  Difficulty:{" "}
                  {selectedActivity.difficulty}
                </p>

                <p className="small">
                  Number of words:{" "}
                  {words.length}
                </p>

                <p className="small">
                  Phoneme hints:{" "}
                  {selectedActivity.showHints
                    ? "On"
                    : "Off"}
                </p>
              </div>

              <div className="button-row">
                <button
                  className="primary"
                  onClick={newGrid}
                >
                  New Preview Grid
                </button>

                <button
                  className="secondary"
                  onClick={generateHTML}
                >
                  Generate HTML
                </button>
              </div>
            </>
          )}

          <div className="info-box">
            <strong>
              How to play:
            </strong>

            <p
              className="small"
              style={{
                marginBottom: 0,
              }}
            >
              Click the first phoneme and
              then the last phoneme of a word.
              Words can be found forwards,
              backwards or diagonally depending
              on the difficulty.
            </p>
          </div>

          {message && (
            <div
              className="message"
              role="status"
            >
              {message}
            </div>
          )}
        </section>

        {/* RIGHT SIDE */}
        <section className="panel">
          <h2>Preview</h2>

          {game ? (
            <>
              <div
                className="search-grid"
                style={{
                  gridTemplateColumns:
                    `repeat(${size}, 1fr)`,
                }}
                aria-label="Word Search grid"
              >
                {game.grid.flatMap(
                  (row, rowIndex) =>
                    row.map(
                      (
                        cell,
                        colIndex
                      ) => {
                        const key =
                          `${rowIndex}-${colIndex}`;

                        const selected =
                          selectedCells.some(
                            (item) =>
                              item.row ===
                                rowIndex &&
                              item.col ===
                                colIndex
                          );

                        const foundCell =
                          foundPositions.includes(
                            key
                          );

                        return (
                          <button
                            key={key}
                            type="button"
                            className={
                              `search-cell ` +
                              `${
                                selected
                                  ? "selected"
                                  : ""
                              } ` +
                              `${
                                foundCell
                                  ? "found"
                                  : ""
                              }`
                            }
                            onClick={() =>
                              checkSelection({
                                row: rowIndex,
                                col: colIndex,
                              })
                            }
                            aria-label={
                              `row ${
                                rowIndex + 1
                              }, column ${
                                colIndex + 1
                              }, ${cell}`
                            }
                          >
                            {cell}
                          </button>
                        );
                      }
                    )
                )}
              </div>

              <h3>
                Words to find
              </h3>

              <div className="word-list">
                {words.map((word) => (
                  <div
                    key={word.id}
                    className={
                      `word-chip ` +
                      `${
                        found.includes(
                          word.englishWord
                        )
                          ? "found"
                          : ""
                      }`
                    }
                  >
                    /{word.phonemes.join(" ")}/
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="small">
              Select an activity and click
              "New Preview Grid".
            </p>
          )}
        </section>
      </div>
    </div>
  );
}