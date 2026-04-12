import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SearchItem = {
  id: string;
  title: string;
  author: string;
  image: string | null;
  href: string;
  source: "local" | "external";
};

type OpenLibraryDoc = {
  edition_key?: string[];
};

type OpenLibraryBook = {
  title?: string;
  authors?: { key: string }[];
};

function notNull<T>(value: T | null): value is T {
  return value !== null;
}

async function fetchOpenLibraryBook(olid: string): Promise<SearchItem | null> {
  try {
    const res = await fetch(`https://openlibrary.org/books/${olid}.json`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const book: OpenLibraryBook = await res.json();

    const title = book.title?.trim();
    if (!title) return null;

    return {
      id: `ol_${olid}`,
      title,
      author: "Unknown Author",
      image: `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`,
      href: `https://openlibrary.org/books/${olid}`,
      source: "external",
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ items: [] });
  }

  const localResults = await prisma.bookListing.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { isbn: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      author: true,
      photos: true,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  const mappedLocal: SearchItem[] = localResults.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    image: book.photos?.[0] ?? null,
    href: `/book_listing/${book.id}`,
    source: "local",
  }));

  if (mappedLocal.length >= 5) {
    return NextResponse.json({ items: mappedLocal });
  }

  let externalResults: SearchItem[] = [];

  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=10`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const data = await res.json();

      const docs: OpenLibraryDoc[] = Array.isArray(data.docs) ? data.docs : [];

      const editionIds = docs
        .map((doc) => doc.edition_key?.[0])
        .filter(Boolean)
        .slice(0, 5 - mappedLocal.length);

      const books = await Promise.all(
        editionIds.map((olid) => fetchOpenLibraryBook(olid as string))
      );

      externalResults = books.filter(notNull);
    }
  } catch (err) {
    console.error("OpenLibrary fetch failed:", err);
  }

  return NextResponse.json({
    items: [...mappedLocal, ...externalResults].slice(0, 5),
  });
}