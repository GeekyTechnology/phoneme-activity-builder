-- CreateTable
CREATE TABLE "ActivityWord" (
    "activityId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,

    PRIMARY KEY ("activityId", "wordId"),
    CONSTRAINT "ActivityWord_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
