import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const condition = String(formData.get("condition") ?? "").trim();
  const isbn = String(formData.get("isbn") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const photos = formData.getAll("photos") as File[];
  const photoUrls: string[] = [];

  // required fields (everything except description)
  if (!title || !author || !category || !condition) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // atleast 1 photo is required
  if (photos.length < 1) {
    return NextResponse.json(
      { error: "At least 1 photo is required." },
      { status: 400 }
    );
  }

  // check if files are valid
  const fileCount = photos.filter((p) => p instanceof File).length;
  if (fileCount !== photos.length) {
    return NextResponse.json({ error: "Invalid photo upload." }, { status: 400 });
  }

  for (let i = 0; i < photos.length; i++) {
    const file = photos[i];
    const filename = `book_${Date.now()}_${i}.${file.name.split(".").pop()}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(process.cwd(), "public", "uploads", "book_covers");
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filepath, buffer);

    photoUrls.push(`/uploads/book_covers/${filename}`);
  }

  // save to db
  const created = await prisma.bookListing.create({
    data: {
      userId: session.user.id,
      title,
      author,
      category,
      condition,
      isbn: isbn || "",
      description: description || null,
      photos: photoUrls,
    },
    select: { id: true, title: true, photos: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/book_listing");

  return NextResponse.json({ ok: true, listing: created }, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const condition = searchParams.get("condition");
  const status = searchParams.get("status");
  const excludeUserId = searchParams.get("exclude");

  // Build the dynamic 'where' object for Prisma
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (condition) {
    where.condition = condition;
  }

  if (status) {
    where.status = status;
  }

  if (excludeUserId) {
    where.userId = { not: excludeUserId };
  }

  const items = await prisma.bookListing.findMany({
    where, // Apply the filters here
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      photos: true,
      author: true,
      category: true,
      condition: true,
      createdAt: true,
      status: true,
      user: {
        select: {
          name: true,
          id: true,
        }
      },
      favoritedBy: session?.user?.id ? {
        where: { userId: session.user.id },
        select: { id: true }
      } : false,
    },
    take: 24,
  });

  const itemsWithBorrowStatus = items.map((item: any) => ({
    ...item,
    isBorrowed: item.status === "BORROWED",
    isFavorited: item.favoritedBy ? item.favoritedBy.length > 0 : false
  }));

  return NextResponse.json({ items: itemsWithBorrowStatus });
}
