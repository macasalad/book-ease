import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, lenderId, borrowDate, returnDate } = await req.json();

    if (!bookId || !lenderId || !borrowDate || !returnDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const book = await prisma.bookListing.findUnique({
      where: { id: bookId },
      select: { status: true, userId: true }
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Book is not available" }, { status: 400 });
    }

    if (book.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot borrow your own book" }, { status: 400 });
    }

    // Check for existing pending request
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: {
        bookId,
        borrowerId: session.user.id,
        status: "PENDING"
      }
    });

    if (existingRequest) {
      return NextResponse.json({ error: "You already have a pending request for this book" }, { status: 400 });
    }

    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        borrowerId: session.user.id,
        lenderId,
        bookId,
        returnDate: new Date(returnDate),
        status: "PENDING"
      }
    });

    return NextResponse.json({ 
      success: true, 
      request: borrowRequest 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating borrow request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}