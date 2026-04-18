import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ listingId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await context.params;

  const listing = await prisma.bookListing.findFirst({
    where: {
      id: listingId,
      userId: session.user.id,
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ listingId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await context.params;
  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const condition = String(formData.get("condition") ?? "").trim();
  const isbn = String(formData.get("isbn") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !author || !category || !condition) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const existingListing = await prisma.bookListing.findFirst({
    where: {
      id: listingId,
      userId: session.user.id,
    },
  });

  if (!existingListing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const updated = await prisma.bookListing.update({
    where: { id: listingId },
    data: {
      title,
      author,
      category,
      condition,
      isbn: isbn || null,
      description: description || null,
    },
    select: {
      id: true,
      title: true,
      photos: true,
    },
  });

  return NextResponse.json({ ok: true, listing: updated });
}