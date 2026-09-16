"use client";

import { useEffect, useMemo, useState } from "react";
import PhonemeKeyboard from "@/components/PhonemeKeyboard";
import { phonemes } from "@/lib/phonemes";
import { generateWordleHtml } from "@/lib/htmlGenerators";

type Word = {
  id: number;
  englishWord: string;
  phonemes: string[];
  hint: string | null;
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
};

type GuessRow = {
  symbols: string[];
  result: string[];
};

export default function WordlePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<GuessRow[]>([]);

  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const [loading, setLoading] = useState(true);

  // Get the saved Wordle activities from the database
  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const response = await fetch("/api/activities");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load activities.");
        return;
      }

      const wordleActivities = data.filter(
        (activity: Activity) =>
          activity.type === "WORDLE" && activity.word
      );

      setActivities(wordleActivities);

      if (wordleActivities.length > 0) {
        setSelectedActivity(wordleActivities[0]);
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not load saved activities.");
    } finally {
      setLoading(false);
    }
  }

  // Get the selected word from the database
  const answer = useMemo(() => {
    return selectedActivity?.word?.phonemes || [];
  }, [selectedActivity]);

  const englishText = selectedActivity?.word?.englishWord || "";

  const showHints = selectedActivity?.showHints ?? true;

  const guessCount = selectedActivity?.numberOfGuesses || 6;

  const difficulty = selectedActivity?.difficulty || "EASY";

  const hint = selectedActivity?.word?.hint || "";

  function reset() {
    setCurrentGuess([]);
    setGuesses([]);
    setMessage("");
    setGameOver(false);
    setWon(false);
  }

  function changeActivity(activityId: string) {
    const activity = activities.find(
      (item) => item.id === Number(activityId)
    );

    setSelectedActivity(activity || null);
    reset();
  }

  function addPhoneme(symbol: string) {
    if (gameOver) {
      return;
    }

    if (currentGuess.length < answer.length) {
      setCurrentGuess([...currentGuess, symbol]);
      setMessage("");
    }
  }

  function removeLast() {
    if (gameOver) {
      return;
    }

    setCurrentGuess(currentGuess.slice(0, -1));
    setMessage("");
  }

  function getResult(guess: string[]) {
    return guess.map((symbol, index) => {
      if (symbol === answer[index]) {
        return "correct";
      }

      if (answer.includes(symbol)) {
        return "close";
      }

      return "wrong";
    });
  }

  function checkAnswer() {
    if (gameOver) {
      return;
    }

    if (currentGuess.length !== answer.length) {
      setMessage("Please fill all the boxes first.");
      return;
    }

    const result = getResult(currentGuess);

    const isCorrect = currentGuess.every(
      (symbol, index) => symbol === answer[index]
    );

    const newGuesses = [
      ...guesses,
      {
        symbols: currentGuess,
        result,
      },
    ];

    setGuesses(newGuesses);
    setCurrentGuess([]);

    if (isCorrect) {
      setWon(true);
      setGameOver(true);

      setMessage(
        `Correct! The English word is ${englishText.toUpperCase()}.`
      );
    } else if (newGuesses.length >= guessCount) {
      setGameOver(true);

      setMessage(
        `No more guesses. The answer was /${answer.join(
          " "
        )}/ (${englishText.toUpperCase()}).`
      );
    } else {
      const guessesLeft = guessCount - newGuesses.length;

      setMessage(
        `Try again. You have ${guessesLeft} guess${
          guessesLeft === 1 ? "" : "es"
        } left.`
      );
    }
  }

  function generateActivity() {
    if (!selectedActivity || answer.length === 0) {
      setMessage("Please select a Wordle activity first.");
      return;
    }

    generateWordleHtml(
      answer,
      englishText,
      guessCount,
      showHints,
      difficulty
    );
  }

  if (loading) {
    return (
      <main className="page">
        <div className="page-heading">
          <h1>PHONEME'LE</h1>
          <p>Loading saved Wordle activities...</p>
        </div>
      </main>
    );
  }

  if (activities.length === 0) {
    return (
      <main className="page">
        <div className="page-heading">
          <h1>PHONEME'LE</h1>

          <p>
            No saved Wordle activities were found.
          </p>

          <p className="small">
            Create a Wordle activity in Activity Management first.
          </p>
        </div>
      </main>
    );
  }

  const emptyRows = Math.max(
    0,
    guessCount - guesses.length - 1
  );

  const totalRows =
    guesses.length + 1 + emptyRows;

  return (
    <div className="page">
      <div className="page-heading">
        <h1>PHONEME'LE</h1>

        <p>
          Wordle style activity builder using saved phoneme data
        </p>
      </div>

      <div className="builder-layout">
        {/* LEFT SIDE */}
        <section className="builder-left">
          <h2>Build Activity</h2>

          <div className="field">
            <label htmlFor="activity">
              Saved Wordle Activity
            </label>

            <select
              id="activity"
              value={selectedActivity?.id || ""}
              onChange={(event) =>
                changeActivity(event.target.value)
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

          <div className="field">
            <label htmlFor="phoneme-word">
              Phoneme Word
            </label>

            <input
              id="phoneme-word"
              value={answer.join(" ")}
              readOnly
            />

            <p className="small">
              This word comes from the database.
            </p>
          </div>

          <div className="field">
            <label htmlFor="english-word">
              English Word
            </label>

            <input
              id="english-word"
              value={englishText.toUpperCase()}
              readOnly
            />
          </div>

          <div className="field">
            <label>Show hints</label>

            <div className="radio-row">
              <label>
                <input
                  type="radio"
                  name="hints"
                  checked={showHints}
                  readOnly
                />
                Yes
              </label>

              <label>
                <input
                  type="radio"
                  name="hints"
                  checked={!showHints}
                  readOnly
                />
                No
              </label>
            </div>
          </div>

          <div className="field inline-field">
            <div>
              <label htmlFor="guesses">
                Number of Guesses
              </label>

              <input
                id="guesses"
                type="number"
                value={guessCount}
                readOnly
              />
            </div>

            <div>
              <label htmlFor="difficulty">
                Difficulty
              </label>

              <select
                id="difficulty"
                value={difficulty}
                disabled
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="button-row">
            <button
              className="primary"
              type="button"
              onClick={generateActivity}
            >
              GENERATE
            </button>

            <button
              className="secondary"
              type="button"
              onClick={reset}
            >
              RESET GAME
            </button>
          </div>

          <div className="info-box">
            <strong>Answer:</strong>{" "}
            /{answer.join(" ")}/
            <br />

            <strong>English:</strong>{" "}
            {englishText.toUpperCase()}
            <br />

            {showHints && hint && (
              <>
                <strong>Hint:</strong> {hint}
              </>
            )}
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="builder-right">
          <h2 className="preview-title">
            Preview
          </h2>

          <div className="preview-main">
            {/* GAME BOARD */}
            <div>
              <p
                className="small"
                style={{ textAlign: "center" }}
              >
                Choose phonemes from the keyboard and
                press ENTER.
              </p>

              <div
                className="wordle-board"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(
                    answer.length,
                    1
                  )}, 46px)`,
                }}
                aria-label="Wordle game board"
              >
                {Array.from({
                  length:
                    totalRows *
                    Math.max(answer.length, 1),
                }).map((_, index) => {
                  const row = Math.floor(
                    index /
                      Math.max(answer.length, 1)
                  );

                  const col =
                    index %
                    Math.max(answer.length, 1);

                  let value = "";

                  let cellClass =
                    "wordle-cell";

                  if (row < guesses.length) {
                    value =
                      guesses[row].symbols[col] ||
                      "";

                    if (
                      guesses[row].result[col] ===
                      "correct"
                    ) {
                      cellClass += " correct";
                    }

                    if (
                      guesses[row].result[col] ===
                      "close"
                    ) {
                      cellClass += " close";
                    }

                    if (
                      guesses[row].result[col] ===
                      "wrong"
                    ) {
                      cellClass += " wrong";
                    }
                  } else if (
                    row === guesses.length
                  ) {
                    value =
                      currentGuess[col] || "";

                    if (value) {
                      cellClass += " active";
                    }
                  }

                  return (
                    <div
                      key={index}
                      className={cellClass}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>

              {message && (
                <div
                  className={`message ${
                    won || !gameOver
                      ? ""
                      : "error"
                  }`}
                  role="status"
                >
                  {message}
                </div>
              )}

              <div
                className="button-row"
                style={{
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                <button
                  className="primary"
                  type="button"
                  onClick={checkAnswer}
                  disabled={gameOver}
                >
                  ENTER
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={removeLast}
                  disabled={gameOver}
                >
                  DELETE
                </button>
              </div>

              <div className="info-box">
                <strong>
                  Phoneme word:
                </strong>{" "}
                /{answer.join(" ")}/
                <br />

                {won && (
                  <>
                    <strong>
                      English word:
                    </strong>{" "}
                    {englishText.toUpperCase()}
                  </>
                )}
              </div>
            </div>

            {/* PHONEME KEYBOARD */}
            <div>
              <p
                className="small"
                style={{ textAlign: "center" }}
              >
                Phoneme keyboard
              </p>

              {showHints ? (
                <PhonemeKeyboard
                  onPick={addPhoneme}
                />
              ) : (
                <div
                  className="phoneme-keyboard"
                  aria-label="Phoneme keyboard"
                >
                  {phonemes.map((item) => (
                    <button
                      key={item.symbol}
                      type="button"
                      className="phoneme-key"
                      onClick={() =>
                        addPhoneme(
                          item.symbol
                        )
                      }
                    >
                      {item.symbol}
                    </button>
                  ))}
                </div>
              )}

              <div className="keyboard-help">
                <strong>Hint:</strong>{" "}
                hover over a phoneme to see
                the English sound when hints
                are on.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}