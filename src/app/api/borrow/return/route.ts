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

    const { borrowId, bookId } = await req.json();

    // Verify the borrow record exists and belongs to this user
    const borrowRecord = await prisma.borrowRecord.findFirst({
      where: {
        id: borrowId,
        borrowerId: session.user.id,
        returnedAt: null
      }
    });

    if (!borrowRecord) {
      return NextResponse.json({ error: "Borrow record not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.borrowRecord.update({
        where: { id: borrowId },
        data: { returnedAt: new Date() }
      }),
      prisma.bookListing.update({
        where: { id: bookId },
        data: { status: "AVAILABLE" }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error returning book:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}