import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "../components/SignOutButton";
import { auth } from "../../../auth";
import { headers } from "next/headers";
import BookSearchBar from "../components/BookSearchBar";

type Listing = {
  id: string;
  title: string;
  photos: string[] | null;
  author: string;
  condition: string;
  isBorrowed?: boolean;
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { search } = await searchParams;
  const trimmedSearch = search?.trim() ?? "";

  const baseUrl = "http://localhost:3000";

  const endpoint = trimmedSearch
    ? `${baseUrl}/api/book_listing?search=${encodeURIComponent(trimmedSearch)}`
    : `${baseUrl}/api/book_listing`;

  const res = await fetch(endpoint, {
    cache: "no-store",
  });

  const data = (await res.json()) as { items: Listing[] };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-x-hidden relative font-sans">
      <nav className="sticky top-0 z-50 w-full border-b border-[#a3b18a]/20 bg-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[15px] font-medium">
          <div className="flex space-x-10 text-[#8a8a8a]">
            <Link href="/dashboard" className="text-[#4a4a4a] font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#bc8a5f] after:rounded-full">Home</Link>
            <Link href="/listing" className="hover:text-[#bc8a5f] transition-colors">Listing</Link>
            <Link href="/catalog" className="hover:text-[#bc8a5f] transition-colors">Catalog</Link>
            <Link href="/borrowing" className="hover:text-[#bc8a5f] transition-colors">Borrowing</Link>
            <Link href="/lending" className="hover:text-[#bc8a5f] transition-colors">Lending</Link>
            <Link href="/messages" className="hover:text-[#bc8a5f] transition-colors">Messages</Link>
          </div>
          <div className="flex space-x-8 items-center">
            <Link href="/profile" className="hover:text-[#bc8a5f] transition-colors font-bold">My Account</Link>
            <div className="opacity-80 hover:opacity-100 transition-opacity">
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="absolute top-40 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">Book Catalog</h1>
            <p className="text-[#8a8a8a] mt-2 font-medium">
              {trimmedSearch
                ? `Showing results for "${trimmedSearch}"`
                : "Discover books from the Ateneo community"}
            </p>
          </div>

          <div className="flex flex-wrap items-center w-full md:w-auto gap-4">
            <Link
              href="/book_listing/new_book"
              className="shrink-0 px-6 py-3 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20"
            >
              + List a Book
            </Link>

            <div className="flex-1 md:w-80 font-inherit">
              <BookSearchBar initialQuery={trimmedSearch} />
            </div>

            <button className="shrink-0 px-6 py-3 bg-white/40 hover:bg-white/60 text-[#5a7d5a] border border-[#a3b18a]/30 font-bold rounded-full transition-all shadow-sm backdrop-blur-md flex items-center gap-2">
              <span>Filters</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        {trimmedSearch && (
          <div className="mb-8 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-[#a3b18a]/30 bg-white/50 px-4 py-2 text-sm font-medium text-[#5a7d5a] hover:bg-white/70 transition-all"
            >
              Clear search
            </Link>
            <span className="text-sm text-[#8a8a8a]">
              {data.items.length} result{data.items.length === 1 ? "" : "s"} found
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {data.items.map((b) => (
            <Link
              key={b.id}
              href={`/book_listing/${b.id}`}
              className="group flex flex-col bg-white/40 border border-white/60 rounded-[1.5rem] p-4 hover:bg-white/60 hover:shadow-xl hover:shadow-[#bc8a5f]/20 transition-all backdrop-blur-md shadow-lg shadow-stone-200/30"
            >
              <div className="aspect-[3/4] w-full bg-[#e2d9c8]/50 rounded-xl overflow-hidden shadow-inner relative flex items-center justify-center border border-white/40 mb-4">
                {b.photos && b.photos[0] ? (
                  <img
                    src={b.photos[0]}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-4xl opacity-50">📖</span>
                )}
              </div>

              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#4a4a4a] group-hover:text-[#bc8a5f] transition-colors line-clamp-1">
                    {b.title}
                  </h3>
                  <p className="text-sm text-[#8a8a8a] line-clamp-1 mt-1">
                    {b.author || "Unknown Author"}
                  </p>
                </div>

                <div className="mt-4 inline-block px-3 py-1.5 bg-[#a3b18a]/20 text-[#5a7d5a] text-xs font-bold uppercase tracking-wider rounded-full w-max">
                  {b.condition ? b.condition.replace("_", " ") : "Available"}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">

                {b.isBorrowed ? (
                  <span className="px-3 py-1.5 bg-[#a3b18a]/20 text-[#7D1128] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    Borrowed
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-[#a3b18a]/20 text-[#5a7d5a] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    Available
                  </span>
                )}

              </div>
            </Link>
          ))}
        </div>

        {trimmedSearch && data.items.length === 0 && (
          <div className="mt-12 rounded-[1.5rem] border border-white/60 bg-white/40 p-8 text-center backdrop-blur-md shadow-lg shadow-stone-200/30">
            <p className="text-lg font-semibold text-[#4a4a4a]">
              No books found for "{trimmedSearch}"
            </p>
            <p className="mt-2 text-sm text-[#8a8a8a]">
              Try a different title or author.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
