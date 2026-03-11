import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

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
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
};

function notNull<T>(value: T | null): value is T {
  return value !== null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = q.toLowerCase();

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

  const seen = new Set(
    mappedLocal.map(
      (item) => `${item.title.toLowerCase()}::${item.author.toLowerCase()}`
    )
  );

  let externalResults: SearchItem[] = [];

  try {
    const openLibraryRes = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20`,
      { cache: "no-store" }
    );

    if (openLibraryRes.ok) {
      const openLibraryData = await openLibraryRes.json();

      const docs: OpenLibraryDoc[] = Array.isArray(openLibraryData.docs)
        ? openLibraryData.docs
        : [];

      externalResults = docs
        .map((doc, index): SearchItem | null => {
          const title = doc.title?.trim() ?? "";
          const author = doc.author_name?.[0]?.trim() ?? "Unknown Author";

          if (!title || !doc.key) return null;

          const titleLower = title.toLowerCase();
          const authorLower = author.toLowerCase();

          const matchesTypedText =
            q.length <= 2
              ? titleLower.startsWith(normalizedQuery) ||
                authorLower.startsWith(normalizedQuery)
              : titleLower.includes(normalizedQuery) ||
                authorLower.includes(normalizedQuery);

          if (!matchesTypedText) return null;

          const dedupeKey = `${titleLower}::${authorLower}`;
          if (seen.has(dedupeKey)) return null;

          seen.add(dedupeKey);

          return {
            id: `ol_${index}_${doc.key}`,
            title,
            author,
            image: doc.cover_i
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
              : null,
            href: `https://openlibrary.org${doc.key}`,
            source: "external",
          };
        })
        .filter(notNull)
        .slice(0, 5 - mappedLocal.length);
    }
  } catch {
    externalResults = [];
  }

  return NextResponse.json({
    items: [...mappedLocal, ...externalResults].slice(0, 5),
  });
}
