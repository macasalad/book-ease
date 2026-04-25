import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { headers } from "next/headers";
import BookSearchBar from "../components/BookSearchBar";
import BookFilters from "../components/BookFilters";
import { prisma } from "@/lib/prisma";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";
import BookCard from "../components/BookCard";

type Listing = {
  id: string;
  title: string;
  photos: string[] | null;
  author: string;
  condition: string;
  isBorrowed?: boolean;
  isFavorited?: boolean;
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; condition?: string; status?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  let loggedInUserId: string | null = null;
  if (session?.user?.email) {
    const userRecord = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    loggedInUserId = userRecord?.id || null;
  }

  const resolvedParams = await searchParams; // Await searchParams once
  const trimmedSearch = resolvedParams.search?.trim() ?? "";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const queryParams = new URLSearchParams();
  if (loggedInUserId) queryParams.set("exclude", loggedInUserId);
  if (trimmedSearch) queryParams.set("search", trimmedSearch);
  if (resolvedParams.category) queryParams.set("category", resolvedParams.category);
  if (resolvedParams.condition) queryParams.set("condition", resolvedParams.condition);
  if (resolvedParams.status) queryParams.set("status", resolvedParams.status);

  // If there are params, append them. Otherwise, use base URL.
  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `${baseUrl}/api/book_listing?${queryString}`
    : `${baseUrl}/api/book_listing`;

  const reqHeaders = new Headers(await headers());

  const res = await fetch(endpoint, {
    cache: "no-store",
    headers: reqHeaders,
  });

  const data = (await res.json()) as { items: Listing[] };

  // Determine if ANY filters or search are active
  const hasActiveFilters = Boolean(trimmedSearch || resolvedParams.category || resolvedParams.condition || resolvedParams.status);

  const headerRight = (
    <>
      <Link
        href="/book_listing/new_book"
        className="shrink-0 px-6 py-3 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20"
      >
        + List a Book
      </Link>

      <div className="flex-1 md:w-80 font-inherit">
        <BookSearchBar initialQuery={trimmedSearch} />
      </div>
      <BookFilters />
    </>
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Book Catalog"
        subtitle={trimmedSearch ? `Showing results for "${trimmedSearch}"` : "Discover books from the Ateneo community"}
        rightContent={headerRight}
      />

      {hasActiveFilters && (
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-[#a3b18a]/30 bg-white/50 px-4 py-2 text-sm font-medium text-[#5a7d5a] hover:bg-white/70 transition-all"
          >
            Clear filters
          </Link>
          <span className="text-sm text-[#8a8a8a]">
            {data.items.length} result{data.items.length === 1 ? "" : "s"} found
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {data.items.map((b) => (
          <BookCard 
            key={b.id} 
            book={{
              ...b,
              isFavorited: b.isFavorited || false
            }} 
          />
        ))}
      </div>

      {/* Updated empty state text to reflect filters */}
      {hasActiveFilters && data.items.length === 0 && (
        <div className="mt-12 rounded-[1.5rem] border border-white/60 bg-white/40 p-8 text-center backdrop-blur-md shadow-lg shadow-stone-200/30">
          <p className="text-lg font-semibold text-[#4a4a4a]">
            No books found matching your criteria.
          </p>
          <p className="mt-2 text-sm text-[#8a8a8a]">
            Try adjusting your search or clearing your filters.
          </p>
        </div>
      )}
    </PageContainer>
  );
}
