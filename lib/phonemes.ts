export type Phoneme = { symbol: string; hint: string };

export const phonemes: Phoneme[] = [
  { symbol: "p", hint: "P (as in pig)" },
  { symbol: "t", hint: "T (as in top)" },
  { symbol: "k", hint: "K (as in cat)" },
  { symbol: "b", hint: "B (as in bed)" },
  { symbol: "d", hint: "D (as in dog)" },
  { symbol: "g", hint: "G (as in go)" },
  { symbol: "m", hint: "M (as in man)" },
  { symbol: "n", hint: "N (as in no)" },
  { symbol: "ŋ", hint: "NG (as in ring)" },
  { symbol: "f", hint: "F (as in fan)" },
  { symbol: "s", hint: "S (as in sun)" },
  { symbol: "θ", hint: "TH (as in thin)" },
  { symbol: "ʃ", hint: "SH (as in ship)" },
  { symbol: "v", hint: "V (as in van)" },
  { symbol: "z", hint: "Z (as in zip)" },
  { symbol: "ð", hint: "TH (as in then)" },
  { symbol: "l", hint: "L (as in log)" },
  { symbol: "ɹ", hint: "R (as in ring)" },
  { symbol: "w", hint: "W (as in win)" },
  { symbol: "j", hint: "Y (as in yes)" },
  { symbol: "h", hint: "H (as in hat)" },
  { symbol: "tʃ", hint: "CH (as in chin)" },
  { symbol: "dʒ", hint: "J (as in jam)" },
  { symbol: "iː", hint: "EE (as in see)" },
  { symbol: "ɪ", hint: "I (as in ship)" },
  { symbol: "e", hint: "E (as in bed)" },
  { symbol: "æ", hint: "A (as in cat)" },
  { symbol: "ɐ", hint: "U (as in sun)" },
  { symbol: "ɜː", hint: "ER (as in bird)" },
  { symbol: "ʉː", hint: "OO (as in boot)" },
  { symbol: "ɔ", hint: "O (as in log)" },
  { symbol: "ʊ", hint: "U (as in book)" },
  { symbol: "əʉ", hint: "O (as in boat)" },
  { symbol: "æɪ", hint: "AI (as in bait)" },
  { symbol: "ɑe", hint: "I (as in bike)" },
  { symbol: "oɪ", hint: "OI (as in boil)" },
  { symbol: "ɪə", hint: "EAR (as in beard)" },
  { symbol: "æɔ", hint: "OU (as in cloud)" },
  { symbol: "ə", hint: "UH (schwa sound)" }
];

export const wordSearchWords = [
  { english: "ship", symbols: ["ʃ", "ɪ", "p"] },
  { english: "chin", symbols: ["tʃ", "ɪ", "n"] },
  { english: "jam", symbols: ["dʒ", "æ", "m"] },
  { english: "ring", symbols: ["ɹ", "ɪ", "ŋ"] },
  { english: "sun", symbols: ["s", "ɐ", "n"] }
];

export const wordleAnswer = { english: "thin", symbols: ["θ", "ɪ", "n"] };
