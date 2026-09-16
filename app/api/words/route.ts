import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all words
export async function GET() {
  try {
    const words = await prisma.word.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not get words" },
      { status: 500 }
    );
  }
}

// CREATE a new word
export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    const newWord = await prisma.word.create({
      data: {
        englishWord: body.englishWord,
        phonemes: body.phonemes,
        hint: body.hint || null,
      },
    });

    return NextResponse.json(newWord, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not create word" },
      { status: 500 }
    );
  }
}