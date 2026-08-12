"use client";

import { phonemes } from "@/lib/phonemes";

export default function PhonemeKeyboard({ onPick }: { onPick: (symbol: string) => void }) {
  return (
    <div className="phoneme-keyboard" aria-label="Phoneme keyboard">
      {phonemes.map((item) => (
        <button
          key={item.symbol}
          className="phoneme-key"
          data-hint={item.hint}
          title={item.hint}
          onClick={() => onPick(item.symbol)}
          type="button"
        >
          {item.symbol}
        </button>
      ))}
    </div>
  );
}
