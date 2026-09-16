"use client";

import { FormEvent, useEffect, useState } from "react";

type Word = {
  id: number;
  englishWord: string;
  phonemes: string[];
  hint: string | null;
};

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([]);

  const [englishWord, setEnglishWord] = useState("");
  const [phonemes, setPhonemes] = useState("");
  const [hint, setHint] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadWords() {
    const response = await fetch("/api/words");
    const data = await response.json();

    if (response.ok) {
      setWords(data);
    }
  }

  useEffect(() => {
    loadWords();
  }, []);

  function clearForm() {
    setEnglishWord("");
    setPhonemes("");
    setHint("");
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!englishWord.trim()) {
      setMessage("Please enter an English word.");
      return;
    }

    const phonemeList = phonemes
      .trim()
      .split(/\s+/)
      .filter((item) => item.length > 0);

    if (phonemeList.length === 0) {
      setMessage("Please enter at least one phoneme.");
      return;
    }

    const wordData = {
      englishWord: englishWord.trim(),
      phonemes: phonemeList,
      hint: hint.trim() || null,
    };

    let response;

    if (editingId) {
      response = await fetch(`/api/words/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData),
      });
    } else {
      response = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wordData),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Something went wrong.");
      return;
    }

    if (editingId) {
      setMessage("Word updated successfully.");
    } else {
      setMessage("Word added successfully.");
    }

    clearForm();
    loadWords();
  }

  function editWord(word: Word) {
    setEditingId(word.id);
    setEnglishWord(word.englishWord);
    setPhonemes(word.phonemes.join(" "));
    setHint(word.hint || "");
    setMessage("Editing word.");
  }

  async function deleteWord(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this word?"
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/words/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not delete word.");
      return;
    }

    setMessage("Word deleted successfully.");

    if (editingId === id) {
      clearForm();
    }

    loadWords();
  }

  return (
    <main className="page">
      <section className="page-heading">
        <h1>Word Management</h1>
        <p>
          Add and manage the phoneme-based words used by the activities.
        </p>
      </section>

      <section className="builder-card">
        <h2>{editingId ? "Edit Word" : "Add Word"}</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="englishWord">English Word</label>
          <input
            id="englishWord"
            type="text"
            value={englishWord}
            onChange={(event) => setEnglishWord(event.target.value)}
            placeholder="Example: thin"
          />

          <label htmlFor="phonemes">Phonemes</label>
          <input
            id="phonemes"
            type="text"
            value={phonemes}
            onChange={(event) => setPhonemes(event.target.value)}
            placeholder="Example: θ ɪ n"
          />

          <small>
            Put a space between each phoneme. Multi-character phonemes such as
            tʃ can stay together.
          </small>

          <label htmlFor="hint">Hint</label>
          <input
            id="hint"
            type="text"
            value={hint}
            onChange={(event) => setHint(event.target.value)}
            placeholder="Example: TH (as in thin)"
          />

          <div className="button-row">
            <button type="submit">
              {editingId ? "Update Word" : "Add Word"}
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

        {message && <p className="form-message">{message}</p>}
      </section>

      <section className="builder-card">
        <div className="section-title-row">
          <h2>Saved Words</h2>

          <button
            type="button"
            className="secondary-button"
            onClick={loadWords}
          >
            Refresh
          </button>
        </div>

        {words.length === 0 ? (
          <p>No words have been added yet.</p>
        ) : (
          <div className="word-list">
            {words.map((word) => (
              <article key={word.id} className="word-item-card">
                <div>
                  <h3>{word.englishWord}</h3>

                  <p>
                    /{word.phonemes.join(" " )}/
                  </p>

                  {word.hint && <p>Hint: {word.hint}</p>}
                </div>

                <div className="button-row">
                  <button
                    type="button"
                    onClick={() => editWord(word)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteWord(word.id)}
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