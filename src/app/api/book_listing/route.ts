import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

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
  if (!title || !author || !category || !condition || !isbn) {
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
      isbn,
      description: description || null,
      photos: photoUrls,
    },
    select: { id: true, title: true, photos: true },
  });

  return NextResponse.json({ ok: true, listing: created }, { status: 201 });
}

export async function GET() {
  const items = await prisma.bookListing.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      photos: true,
      author: true,
      category: true,
      condition: true,
      createdAt: true,
    },
    take: 24,
  });

  return NextResponse.json({ items });
}
