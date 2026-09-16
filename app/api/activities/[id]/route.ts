import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = Number(id);

    if (Number.isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
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

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not get activity" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = Number(id);
    const body = await request.json();

    if (Number.isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

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
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    if (
      body.difficulty !== "EASY" &&
      body.difficulty !== "MEDIUM" &&
      body.difficulty !== "HARD"
    ) {
      return NextResponse.json(
        { error: "Invalid difficulty" },
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

    /*
      WORDLE
      One word is attached with wordId.
    */

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

    /*
      WORD SEARCH
      Multiple words are stored in ActivityWord.
    */

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

    /*
      Update the main activity.
    */

    const updatedActivity =
      await prisma.activity.update({
        where: {
          id: activityId,
        },

        data: {
          name: body.name,
          type: body.type,
          difficulty: body.difficulty,
          showHints: body.showHints !== false,
          numberOfGuesses: guesses,

          wordId:
            body.type === "WORDLE"
              ? Number(body.wordId)
              : null,
        },
      });

    /*
      If this is Word Search, replace
      the old ActivityWord records.
    */

    if (body.type === "WORD_SEARCH") {
      await prisma.activityWord.deleteMany({
        where: {
          activityId: activityId,
        },
      });

      await prisma.activityWord.createMany({
        data: wordIds.map((wordId) => ({
          activityId: activityId,
          wordId: wordId,
        })),
      });
    } else {
      // Wordle doesn't need ActivityWord records.
      await prisma.activityWord.deleteMany({
        where: {
          activityId: activityId,
        },
      });
    }

    /*
      Get the updated activity with all
      related words.
    */

    const result =
      await prisma.activity.findUnique({
        where: {
          id: activityId,
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

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not update activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = Number(id);

    if (Number.isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    await prisma.activity.delete({
      where: {
        id: activityId,
      },
    });

    return NextResponse.json({
      message:
        "Activity deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not delete activity" },
      { status: 500 }
    );
  }
}