import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "../components/SignOutButton";
import { auth } from "../../../auth";
import { headers } from "next/headers";

type Listing = { 
  id: string; 
  title: string; 
  photos: string[] | null;
};

export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // currently set for development
  const res = await fetch("http://localhost:3000/api/book_listing", {
    cache: "no-store",
  });
  const data = (await res.json()) as { items: Listing[] };

  return (
    <section className="p-6 md:p-10 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalog</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/book_listing/new_book"
            className="rounded border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-all"
          >
            + Add Book
          </Link>
          <div className="rounded border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-all cursor-pointer">
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="flex items-center gap-3">
        <input
          placeholder="Search…"
          className="w-full max-w-md rounded border border-white/10 bg-white/5 px-3 py-2"
        />
        <button className="rounded border border-white/10 bg-white/5 px-3 py-2">
          Filters
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.items.map((b) => (
          <Link
            key={b.id}
            href={`/book_listing/${b.id}`}
            className="block rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10"
          >
            <div className="aspect-3/4 w-full rounded overflow-hidden">
              {b.photos && b.photos[0] ? (
                <img 
                  src={b.photos[0]} 
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/30 flex items-center justify-center">
                  📖
                </div>
              )}
            </div>
            <div className="mt-2 text-sm font-medium">{b.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
