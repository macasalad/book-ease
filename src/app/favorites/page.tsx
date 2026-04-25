import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import FavoriteButton from "../components/FavoriteButton";

const prisma = new PrismaClient();

export default async function FavoritesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      book: {
        include: {
          user: { select: { id: true, name: true } },
          favoritedBy: {
            where: { userId: session.user.id }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-x-hidden relative font-sans">
      <div className="absolute top-40 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
      <div className="flex justify-between items-end mb-4 border-b border-[#a3b18a]/30 pb-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">
          My Favorites
        </h1>
        <p className="text-[#8a8a8a] mt-2 font-medium">
          Books you have saved for later.
        </p>
      </div>
    </div>

        {favorites.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-stone-200/50">
            <span className="text-6xl mb-6 block">📚</span>
            <p className="text-xl font-semibold text-[#4a4a4a] mb-2">
              You haven't liked any books yet.
            </p>
            <p className="text-[#8a8a8a] mb-6">
              When you see a book you like, click the heart icon to save it here.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {favorites.map(({ book: b }) => (
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
                  {b.status === "BORROWED" ? (
                    <span className="px-3 py-1.5 bg-[#a3b18a]/20 text-[#7D1128] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Borrowed
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-[#a3b18a]/20 text-[#5a7d5a] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Available
                    </span>
                  )}

                  <div className="ml-auto -mr-2 -mt-1 -mb-1">
                    <FavoriteButton bookId={b.id} initialIsFavorited={true} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
