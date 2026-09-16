import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET one word
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wordId = Number(id);

    if (Number.isNaN(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    const word = await prisma.word.findUnique({
      where: {
        id: wordId,
      },
    });

    if (!word) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not get word" },
      { status: 500 }
    );
  }
}

// UPDATE one word
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wordId = Number(id);
    const body = await request.json();

    if (Number.isNaN(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    if (!body.englishWord) {
      return NextResponse.json(
        { error: "English word is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.phonemes) || body.phonemes.length === 0) {
      return NextResponse.json(
        { error: "At least one phoneme is required" },
        { status: 400 }
      );
    }

    const updatedWord = await prisma.word.update({
      where: {
        id: wordId,
      },
      data: {
        englishWord: body.englishWord,
        phonemes: body.phonemes,
        hint: body.hint || null,
      },
    });

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not update word" },
      { status: 500 }
    );
  }
}

// DELETE one word
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wordId = Number(id);

    if (Number.isNaN(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    await prisma.word.delete({
      where: {
        id: wordId,
      },
    });

    return NextResponse.json({
      message: "Word deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not delete word" },
      { status: 500 }
    );
  }
}