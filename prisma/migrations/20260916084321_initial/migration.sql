-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "englishWord" TEXT NOT NULL,
    "phonemes" JSONB NOT NULL,
    "hint" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "showHints" BOOLEAN NOT NULL DEFAULT true,
    "numberOfGuesses" INTEGER NOT NULL DEFAULT 6,
    "wordId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
