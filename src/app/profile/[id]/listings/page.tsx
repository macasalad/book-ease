import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "../../../components/SignOutButton";
import { BookListing } from "@prisma/client";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2ece4] text-[#4a4a4a]">
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p className="text-red-500">Failed to load listings. Check the server console.</p>
      </div>
    );
  }

  const data = (await res.json()) as { items: Listing[] };
  const userListings = data?.items || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-x-hidden relative font-sans">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#a3b18a]/20 bg-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[15px] font-medium">
          {/* Navigation Links */}
          <div className="flex space-x-10 text-[#8a8a8a]">
            <Link href="/dashboard" className="hover:text-[#bc8a5f] transition-colors">Home</Link>
            <Link href="/listing" className="hover:text-[#bc8a5f] transition-colors">Listing</Link>
            <Link href="/catalog" className="hover:text-[#bc8a5f] transition-colors">Catalog</Link>
            <Link href="/borrowing" className="hover:text-[#bc8a5f] transition-colors">Borrowing</Link>
            <Link href="/lending" className="hover:text-[#bc8a5f] transition-colors">Lending</Link>
            <Link href="/messages" className="hover:text-[#bc8a5f] transition-colors">Messages</Link>
          </div>

          {/* User Actions */}
          <div className="flex space-x-8 items-center">
            <Link 
              href="/profile" 
              className="text-[#4a4a4a] font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#bc8a5f] after:rounded-full"
            >
              My Account
            </Link>
            {isOwnListings && (
              <div className="opacity-80 hover:opacity-100 transition-opacity">
                <SignOutButton />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Background Decorative Circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10 border-b border-[#a3b18a]/30 pb-6">
          <div>
            <Link href={`/profile/${profileUser.id}`} className="text-[#a3b18a] hover:text-[#bc8a5f] text-sm font-semibold tracking-wide flex items-center gap-2 mb-2 transition-colors">
              &larr; Back to Profile
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">
              {isOwnListings ? "My Book Listings" : `${profileUser.name || "User"}'s Listings`}
            </h1>
            <p className="text-[#8a8a8a] mt-2">
              {userListings.length} {userListings.length === 1 ? 'book' : 'books'} available
            </p>
          </div>

          {/* Only show "Add New Listing" if it's their own page */}
          {isOwnListings && (
            <Link 
              href="/book_listing/new" 
              className="px-6 py-2.5 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20 active:scale-95"
            >
              + Add New Book
            </Link>
          )}
        </div>

        {/* Listings Grid */}
        {userListings.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-stone-200/50">
            <div className="text-[#a3b18a] text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-[#4a4a4a] mb-2">No listings found</h3>
            <p className="text-[#8a8a8a] text-center max-w-md">
              {isOwnListings 
                ? "You haven't listed any books yet. Add your first book to start sharing with the community!" 
                : "This user hasn't listed any books yet. Check back later!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {userListings.map((book) => (
              <Link
                key={book.id}
                href={`/book_listing/${book.id}`}
                className="group flex flex-col bg-white/40 border border-white/60 rounded-[1.5rem] p-4 hover:bg-white/60 hover:shadow-xl hover:shadow-[#bc8a5f]/20 transition-all backdrop-blur-md shadow-lg shadow-stone-200/30"
              >
                <div className="aspect-[3/4] w-full bg-[#e2d9c8]/50 rounded-xl overflow-hidden shadow-inner relative flex items-center justify-center border border-white/40 mb-4">
                  {book.photos && book.photos[0] ? (
                    <img
                      src={book.photos[0]}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-4xl opacity-50">📖</span>
                  )}
                </div>

                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#4a4a4a] group-hover:text-[#bc8a5f] transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-[#8a8a8a] line-clamp-1 mt-1">
                      {book.author || "Unknown Author"}
                    </p>
                  </div>

                  <div className="mt-4 inline-block px-3 py-1.5 bg-[#a3b18a]/20 text-[#5a7d5a] text-xs font-bold uppercase tracking-wider rounded-full w-max">
                    {book.condition ? book.condition.replace("_", " ") : "Available"}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {book.isBorrowed ? (
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
        )}
      </div>
    </main>
  );
}