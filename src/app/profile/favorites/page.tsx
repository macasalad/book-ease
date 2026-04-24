import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import PageContainer from "@/app/components/PageContainer";
import PageHeader from "@/app/components/PageHeader";
import BookCard from "@/app/components/BookCard";

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
    <PageContainer>
      <PageHeader 
        title="My Favorites"
        subtitle="Books you have saved for later."
      />

      {favorites.length === 0 ? (
        <div className="mt-12 rounded-[1.5rem] border border-white/60 bg-white/40 p-12 text-center backdrop-blur-md shadow-lg shadow-stone-200/30 w-full">
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
            <BookCard 
              key={b.id} 
              book={{
                ...b,
                isBorrowed: b.status === "BORROWED",
                isFavorited: true
              }} 
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
