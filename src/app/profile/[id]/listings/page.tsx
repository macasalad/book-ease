import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookListing } from "@prisma/client";
import PageContainer from "@/app/components/PageContainer";
import PageHeader from "@/app/components/PageHeader";
import BookCard from "@/app/components/BookCard";

export const dynamic = 'force-dynamic';

interface ListingsProps {
  params: Promise<{ id: string }>
}

type Listing = BookListing & {
  isBorrowed: boolean;
};

export default async function UserListings({ params }: ListingsProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  
  if (!rawId) {
    return notFound();
  }

  const id = decodeURIComponent(rawId).trim();

  const profileUser = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!profileUser) {
    return notFound();
  }

  // Check the currently logged-in user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let isOwnListings = false;
  if (session?.user?.email) {
    const loggedInUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    isOwnListings = loggedInUser?.id === profileUser.id;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const endpoint = `${baseUrl}/api/profile/${id}/listings`;
  
  const res = await fetch(endpoint, {
    cache: "no-store",
  });
  
  if (!res.ok) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold mb-2 text-[#4a4a4a]">Oops!</h2>
          <p className="text-red-500">Failed to load listings. Check the server console.</p>
        </div>
      </PageContainer>
    );
  }

  const data = (await res.json()) as { items: Listing[] };
  const userListings = data?.items || [];

  const availableCount = userListings.filter((book) => !book.isBorrowed).length;

  const headerRight = isOwnListings ? (
    <Link 
      href="/book_listing/new_book" 
      className="px-6 py-2.5 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20 active:scale-95"
    >
      + Add New Book
    </Link>
  ) : undefined;

  return (
    <PageContainer>
      <PageHeader 
        title={isOwnListings ? "My Book Listings" : `${profileUser.name || "User"}'s Listings`}
        subtitle={`${availableCount} ${availableCount === 1 ? 'book' : 'books'} available`}
        rightContent={headerRight}
      />

      {userListings.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-stone-200/50">
          <div className="text-[#a3b18a] text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-[#4a4a4a] mb-4">No listings found</h3>
          <p className="text-[#8a8a8a] text-center max-w-md">
            {isOwnListings 
              ? "You haven't listed any books yet. Add your first book to start sharing with the community!" 
              : "This user hasn't listed any books yet. Check back later!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {userListings.map((book) => (
            <BookCard 
              key={book.id} 
              book={{
                ...book,
                isBorrowed: book.isBorrowed
              }} 
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}