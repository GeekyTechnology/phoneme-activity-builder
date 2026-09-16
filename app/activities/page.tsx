"use client";

import { FormEvent, useEffect, useState } from "react";

type Word = {
  id: number;
  englishWord: string;
  phonemes: string[];
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
  activityWords?: ActivityWord[];
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [words, setWords] = useState<Word[]>([]);

  const [name, setName] = useState("");
  const [type, setType] = useState("WORDLE");
  const [difficulty, setDifficulty] = useState("EASY");
  const [showHints, setShowHints] = useState(true);
  const [numberOfGuesses, setNumberOfGuesses] = useState("6");

  // Used for Wordle
  const [wordId, setWordId] = useState("");

  // Used for Word Search
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const wordResponse = await fetch("/api/words");
      const wordData = await wordResponse.json();

      const activityResponse = await fetch("/api/activities");
      const activityData = await activityResponse.json();

      if (wordResponse.ok) {
        setWords(wordData);
      }

      if (activityResponse.ok) {
        setActivities(activityData);
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not load the data.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function clearForm() {
    setName("");
    setType("WORDLE");
    setDifficulty("EASY");
    setShowHints(true);
    setNumberOfGuesses("6");
    setWordId("");
    setSelectedWordIds([]);
    setEditingId(null);
  }

  function changeType(newType: string) {
    setType(newType);

    // Clear the other word selection when changing activity type
    setWordId("");
    setSelectedWordIds([]);
  }

  function toggleWord(wordId: number) {
    if (selectedWordIds.includes(wordId)) {
      setSelectedWordIds(
        selectedWordIds.filter((id) => id !== wordId)
      );
    } else {
      setSelectedWordIds([
        ...selectedWordIds,
        wordId,
      ]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter an activity name.");
      return;
    }

    if (type === "WORDLE" && !wordId) {
      setMessage("Please select a word for Wordle.");
      return;
    }

    if (
      type === "WORD_SEARCH" &&
      selectedWordIds.length === 0
    ) {
      setMessage(
        "Please select at least one word for Word Search."
      );
      return;
    }

    const activityData = {
      name: name.trim(),
      type,
      difficulty,
      showHints,
      numberOfGuesses: Number(numberOfGuesses),

      // Wordle uses one word
      wordId:
        type === "WORDLE" && wordId
          ? Number(wordId)
          : null,

      // Word Search uses multiple words
      wordIds:
        type === "WORD_SEARCH"
          ? selectedWordIds
          : [],
    };

    let response;

    if (editingId) {
      response = await fetch(
        `/api/activities/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(activityData),
        }
      );
    } else {
      response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activityData),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.error || "Something went wrong."
      );
      return;
    }

    setMessage(
      editingId
        ? "Activity updated successfully."
        : "Activity added successfully."
    );

    clearForm();
    loadData();
  }

  function editActivity(activity: Activity) {
    setEditingId(activity.id);
    setName(activity.name);
    setType(activity.type);
    setDifficulty(activity.difficulty);
    setShowHints(activity.showHints);
    setNumberOfGuesses(
      String(activity.numberOfGuesses)
    );

    if (activity.type === "WORDLE") {
      setWordId(
        activity.wordId
          ? String(activity.wordId)
          : ""
      );

      setSelectedWordIds([]);
    } else {
      setWordId("");

      const ids =
        activity.activityWords?.map(
          (item) => item.word.id
        ) || [];

      setSelectedWordIds(ids);
    }

    setMessage("Editing activity.");
  }

  async function deleteActivity(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(
      `/api/activities/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.error || "Could not delete activity."
      );
      return;
    }

    setMessage(
      "Activity deleted successfully."
    );

    if (editingId === id) {
      clearForm();
    }

    loadData();
  }

  return (
    <main className="page">
      <section className="page-heading">
        <h1>Activity Management</h1>

        <p>
          Save the settings used to create Wordle
          and Word Search activities.
        </p>
      </section>

      <section className="builder-card">
        <h2>
          {editingId
            ? "Edit Activity"
            : "Add Activity"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">
            Activity Name
          </label>

          <input
            id="name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Example: Thin Wordle"
          />

          <label htmlFor="type">
            Activity Type
          </label>

          <select
            id="type"
            value={type}
            onChange={(event) =>
              changeType(event.target.value)
            }
          >
            <option value="WORDLE">
              Wordle
            </option>

            <option value="WORD_SEARCH">
              Word Search
            </option>
          </select>

          <label htmlFor="difficulty">
            Difficulty
          </label>

          <select
            id="difficulty"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value)
            }
          >
            <option value="EASY">
              Easy
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HARD">
              Hard
            </option>
          </select>

          {type === "WORDLE" && (
            <>
              <label htmlFor="word">
                Word
              </label>

              <select
                id="word"
                value={wordId}
                onChange={(event) =>
                  setWordId(event.target.value)
                }
              >
                <option value="">
                  Select a word
                </option>

                {words.map((word) => (
                  <option
                    key={word.id}
                    value={word.id}
                  >
                    {word.englishWord} - /{" "}
                    {word.phonemes.join(" ")}
                    /
                  </option>
                ))}
              </select>
            </>
          )}

          {type === "WORD_SEARCH" && (
            <div className="word-selection">
              <label>
                Words for Word Search
              </label>

              <p className="small">
                Select the words you want in
                this Word Search.
              </p>

              <div className="word-checkbox-list">
                {words.map((word) => (
                  <label
                    key={word.id}
                    className="word-checkbox"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWordIds.includes(
                        word.id
                      )}
                      onChange={() =>
                        toggleWord(word.id)
                      }
                    />

                    <span>
                      {word.englishWord}{" "}
                      /{word.phonemes.join(" ")}/
                    </span>
                  </label>
                ))}
              </div>

              <p className="small">
                Selected:{" "}
                {selectedWordIds.length}
              </p>
            </div>
          )}

          <label htmlFor="guesses">
            Number of Guesses
          </label>

          <input
            id="guesses"
            type="number"
            min="1"
            max="10"
            value={numberOfGuesses}
            onChange={(event) =>
              setNumberOfGuesses(
                event.target.value
              )
            }
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showHints}
              onChange={(event) =>
                setShowHints(
                  event.target.checked
                )
              }
            />

            Show phoneme hints
          </label>

          <div className="button-row">
            <button type="submit">
              {editingId
                ? "Update Activity"
                : "Add Activity"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}
      </section>

      <section className="builder-card">
        <h2>Saved Activities</h2>

        {activities.length === 0 ? (
          <p>
            No activities have been added yet.
          </p>
        ) : (
          <div className="word-list">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="word-item-card"
              >
                <div>
                  <h3>{activity.name}</h3>

                  <p>
                    {activity.type} -{" "}
                    {activity.difficulty}
                  </p>

                  <p>
                    Guesses:{" "}
                    {activity.numberOfGuesses}
                  </p>

                  <p>
                    Hints:{" "}
                    {activity.showHints
                      ? "Yes"
                      : "No"}
                  </p>

                  {activity.type ===
                    "WORDLE" &&
                    activity.word && (
                      <p>
                        Word:{" "}
                        {
                          activity.word
                            .englishWord
                        }
                      </p>
                    )}

                  {activity.type ===
                    "WORD_SEARCH" &&
                    activity.activityWords &&
                    activity.activityWords
                      .length > 0 && (
                      <div>
                        <p>
                          Words:
                        </p>

                        {activity.activityWords.map(
                          (item) => (
                            <span
                              key={
                                item.word.id
                              }
                              className="word-chip"
                            >
                              {
                                item.word
                                  .englishWord
                              }
                            </span>
                          )
                        )}
                      </div>
                    )}
                </div>

                <div className="button-row">
                  <button
                    type="button"
                    onClick={() =>
                      editActivity(
                        activity
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      deleteActivity(
                        activity.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}