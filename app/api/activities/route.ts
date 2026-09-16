import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        word: true,
        activityWords: {
          include: {
            word: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not get activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name) {
      return NextResponse.json(
        { error: "Activity name is required" },
        { status: 400 }
      );
    }

    if (
      body.type !== "WORDLE" &&
      body.type !== "WORD_SEARCH"
    ) {
      return NextResponse.json(
        {
          error:
            "Activity type must be WORDLE or WORD_SEARCH",
        },
        { status: 400 }
      );
    }

    if (
      body.difficulty !== "EASY" &&
      body.difficulty !== "MEDIUM" &&
      body.difficulty !== "HARD"
    ) {
      return NextResponse.json(
        {
          error:
            "Difficulty must be EASY, MEDIUM or HARD",
        },
        { status: 400 }
      );
    }

    const guesses = Number(
      body.numberOfGuesses ?? 6
    );

    if (guesses < 1 || guesses > 10) {
      return NextResponse.json(
        {
          error:
            "Number of guesses must be between 1 and 10",
        },
        { status: 400 }
      );
    }

    // WORDLE uses one word
    if (body.type === "WORDLE") {
      if (
        body.wordId === undefined ||
        body.wordId === null
      ) {
        return NextResponse.json(
          {
            error:
              "Wordle activities need one word",
          },
          { status: 400 }
        );
      }

      const word = await prisma.word.findUnique({
        where: {
          id: Number(body.wordId),
        },
      });

      if (!word) {
        return NextResponse.json(
          {
            error:
              "Selected Wordle word does not exist",
          },
          { status: 400 }
        );
      }
    }

    // WORD SEARCH uses multiple words
    let wordIds: number[] = [];

    if (body.type === "WORD_SEARCH") {
      if (
        !Array.isArray(body.wordIds) ||
        body.wordIds.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "Word Search needs at least one word",
          },
          { status: 400 }
        );
      }

      wordIds = body.wordIds.map(
        (id: number) => Number(id)
      );

      const words = await prisma.word.findMany({
        where: {
          id: {
            in: wordIds,
          },
        },
      });

      if (words.length !== wordIds.length) {
        return NextResponse.json(
          {
            error:
              "One or more selected words do not exist",
          },
          { status: 400 }
        );
      }
    }

    const activity = await prisma.activity.create({
      data: {
        name: body.name,
        type: body.type,
        difficulty: body.difficulty,
        showHints: body.showHints !== false,
        numberOfGuesses: guesses,

        // Wordle word
        wordId:
          body.type === "WORDLE"
            ? Number(body.wordId)
            : null,

        // Word Search words
        activityWords:
          body.type === "WORD_SEARCH"
            ? {
                create: wordIds.map(
                  (wordId) => ({
                    wordId,
                  })
                ),
              }
            : undefined,
      },

      include: {
        word: true,
        activityWords: {
          include: {
            word: true,
          },
        },
      },
    });

    return NextResponse.json(
      activity,
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not create activity" },
      { status: 500 }
    );
  }
}