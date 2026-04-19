import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; // Adjust this path if your auth.ts is not aliased to @/auth

// POST: Add a book to favorites
export async function POST(req: Request) {
  try {
    // Authenticate the user via Better Auth using request headers
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { bookId } = body;

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        bookId: bookId,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error("Error adding favorite:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE: Remove a book from favorites
export async function DELETE(req: Request) {
  try {
    // Authenticate the user via Better Auth using request headers
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { bookId } = body;

    await prisma.favorite.delete({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: bookId,
        },
      },
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}