"use client";

import { useMemo, useState } from "react";
import PhonemeKeyboard from "@/components/PhonemeKeyboard";
import { phonemes, wordleAnswer } from "@/lib/phonemes";
import { generateWordleHtml } from "@/lib/htmlGenerators";

type GuessRow = {
  symbols: string[];
  result: string[];
};

export default function WordlePage() {
  const [phonemeText, setPhonemeText] = useState(wordleAnswer.symbols.join(" "));
  const [englishText, setEnglishText] = useState(wordleAnswer.english.toUpperCase());
  const [showHints, setShowHints] = useState(true);
  const [guessCount, setGuessCount] = useState(6);
  const [difficulty, setDifficulty] = useState("Easy");
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const answer = useMemo(() => {
    return phonemeText.trim().split(/\s+/).filter(Boolean);
  }, [phonemeText]);

  function addPhoneme(symbol: string) {
    if (gameOver) return;
    if (currentGuess.length < answer.length) {
      setCurrentGuess([...currentGuess, symbol]);
      setMessage("");
    }
  }

  function removeLast() {
    if (gameOver) return;
    setCurrentGuess(currentGuess.slice(0, -1));
    setMessage("");
  }

  function getResult(guess: string[]) {
    return guess.map((symbol, index) => {
      if (symbol === answer[index]) return "correct";
      if (answer.includes(symbol)) return "close";
      return "wrong";
    });
  }

  function checkAnswer() {
    if (gameOver) return;

    if (currentGuess.length !== answer.length) {
      setMessage("Please fill all the boxes first.");
      return;
    }

    const result = getResult(currentGuess);
    const isCorrect = currentGuess.every((symbol, index) => symbol === answer[index]);
    const newGuesses = [...guesses, { symbols: currentGuess, result }];

    setGuesses(newGuesses);
    setCurrentGuess([]);

    if (isCorrect) {
      setWon(true);
      setGameOver(true);
      setMessage(`Correct! The English word is ${englishText.toUpperCase()}.`);
    } else if (newGuesses.length >= guessCount) {
      setGameOver(true);
      setMessage(`No more guesses. The answer was /${answer.join(" ")}/ (${englishText.toUpperCase()}).`);
    } else {
      setMessage(`Try again. You have ${guessCount - newGuesses.length} guess${guessCount - newGuesses.length === 1 ? "" : "es"} left.`);
    }
  }

  function reset() {
    setCurrentGuess([]);
    setGuesses([]);
    setMessage("");
    setGameOver(false);
    setWon(false);
  }

  function updateDifficulty(value: string) {
    setDifficulty(value);
    if (value === "Easy") setGuessCount(6);
    if (value === "Medium") setGuessCount(5);
    if (value === "Hard") setGuessCount(4);
    reset();
  }

  function changeGuessCount(value: string) {
    const number = Math.max(3, Math.min(10, Number(value) || 6));
    setGuessCount(number);
    reset();
  }

  function changePhonemeWord(value: string) {
    setPhonemeText(value);
    reset();
  }

  const emptyRows = Math.max(0, guessCount - guesses.length - 1);
  const totalRows = guesses.length + 1 + emptyRows;

  return (
    <div className="page">
      <div className="page-heading">
        <h1>PHONEME'LE</h1>
        <p>Wordle style activity builder using phoneme symbols</p>
      </div>

      <div className="builder-layout">
        <section className="builder-left">
          <h2>Build Activity</h2>

          <div className="field">
            <label htmlFor="phoneme-word">Phoneme Word</label>
            <input
              id="phoneme-word"
              value={phonemeText}
              onChange={(e) => changePhonemeWord(e.target.value)}
              aria-describedby="phoneme-help"
            />
            <p id="phoneme-help" className="small">Use spaces between phonemes, for example: θ ɪ n</p>
          </div>

          <div className="field">
            <label htmlFor="english-word">English Word</label>
            <input
              id="english-word"
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Show hints</label>
            <div className="radio-row">
              <label><input type="radio" name="hints" checked={showHints} onChange={() => setShowHints(true)} /> Yes</label>
              <label><input type="radio" name="hints" checked={!showHints} onChange={() => setShowHints(false)} /> No</label>
            </div>
          </div>

          <div className="field inline-field">
            <div>
              <label htmlFor="guesses">Number of Guesses</label>
              <input
                id="guesses"
                type="number"
                min="3"
                max="10"
                value={guessCount}
                onChange={(e) => changeGuessCount(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="difficulty">Difficulty</label>
              <select id="difficulty" value={difficulty} onChange={(e) => updateDifficulty(e.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <div className="button-row">
            <button
              className="primary"
              type="button"
              onClick={() => generateWordleHtml(answer, englishText, guessCount, showHints, difficulty)}
            >
              GENERATE
            </button>
            <button className="secondary" type="button" onClick={reset}>RESET GAME</button>
          </div>

          <div className="info-box">
            <strong>Answer:</strong> /{answer.join(" ")}/<br />
            <strong>English:</strong> {englishText.toUpperCase()}
          </div>
        </section>

        <section className="builder-right">
          <h2 className="preview-title">Preview</h2>
          <div className="preview-main">
            <div>
              <p className="small" style={{ textAlign: "center" }}>Build a guess with the phoneme keyboard, then press ENTER.</p>

              <div
                className="wordle-board"
                style={{ gridTemplateColumns: `repeat(${Math.max(answer.length, 1)}, 46px)` }}
                aria-label="Wordle game board"
              >
                {Array.from({ length: totalRows * Math.max(answer.length, 1) }).map((_, index) => {
                  const row = Math.floor(index / Math.max(answer.length, 1));
                  const col = index % Math.max(answer.length, 1);

                  let value = "";
                  let cellClass = "wordle-cell";

                  if (row < guesses.length) {
                    value = guesses[row].symbols[col] || "";
                    if (guesses[row].result[col] === "correct") cellClass += " correct";
                    if (guesses[row].result[col] === "close") cellClass += " close";
                    if (guesses[row].result[col] === "wrong") cellClass += " wrong";
                  } else if (row === guesses.length) {
                    value = currentGuess[col] || "";
                    if (value) cellClass += " active";
                  }

                  return <div key={index} className={cellClass}>{value}</div>;
                })}
              </div>

              {message && (
                <div className={`message ${won ? "" : gameOver ? "error" : ""}`} role="status">
                  {message}
                </div>
              )}

              <div className="button-row" style={{ justifyContent: "center", marginTop: 12 }}>
                <button className="primary" type="button" onClick={checkAnswer} disabled={gameOver}>ENTER</button>
                <button className="secondary" type="button" onClick={removeLast} disabled={gameOver}>DELETE</button>
              </div>

              <div className="info-box">
                <strong>Phoneme word:</strong> /{answer.join(" ")}/<br />
                {won && <><strong>English word:</strong> {englishText.toUpperCase()}</>}
              </div>
            </div>

            <div>
              <p className="small" style={{ textAlign: "center" }}>Phoneme keyboard</p>
              {showHints ? (
                <PhonemeKeyboard onPick={addPhoneme} />
              ) : (
                <div className="phoneme-keyboard" aria-label="Phoneme keyboard">
                  {phonemes.map((item) => (
                    <button key={item.symbol} type="button" className="phoneme-key" onClick={() => addPhoneme(item.symbol)}>
                      {item.symbol}
                    </button>
                  ))}
                </div>
              )}

              <div className="keyboard-help">
                <strong>Hint:</strong> hover over a phoneme to see the English sound when hints are on.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
