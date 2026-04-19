import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "../../../../auth";
import { PrismaClient } from "@prisma/client";
import BorrowModal from "../components/BorrowModal";
import FavoriteButton from "../../components/FavoriteButton";

const prisma = new PrismaClient();

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { listingId } = await params;

  if (!listingId) {
    redirect("/book_listing");
  }

  const listing = await prisma.bookListing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      author: true,
      category: true,
      condition: true,
      isbn: true,
      description: true,
      photos: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          customImage: true,
        },
      },
      favoritedBy: {
        where: { userId: session.user.id },
        select: { id: true }
      }
    },
  });

  if (!listing) {
    redirect("/book_listing");
  }

  const safeListing = listing;
  const isOwner = session.user.id === safeListing.user.id;
  const initialIsFavorited = safeListing.favoritedBy && safeListing.favoritedBy.length > 0;

  async function startConversation() {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession?.user?.id) {
      redirect("/sign-in");
    }

    const currentUserId = currentSession.user.id;
    const targetUserId = safeListing.user.id;

    if (currentUserId === targetUserId) {
      redirect(`/book_listing/${safeListing.id}`);
    }

    const candidateConversations = await prisma.conversation.findMany({
      where: {
        AND: [
          {
            participants: {
              some: { userId: currentUserId },
            },
          },
          {
            participants: {
              some: { userId: targetUserId },
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const existingConversation = candidateConversations.find((conversation) => {
      if (conversation.participants.length !== 2) return false;

      const ids = conversation.participants.map((p) => p.userId).sort();
      const expected = [currentUserId, targetUserId].sort();

      return ids[0] === expected[0] && ids[1] === expected[1];
    });

    if (existingConversation) {
      redirect(`/messages/${existingConversation.id}`);
    }

    const createdConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            {
              userId: currentUserId,
              lastReadAt: new Date(),
            },
            {
              userId: targetUserId,
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });

    redirect(`/messages/${createdConversation.id}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-x-hidden relative font-sans p-6 md:p-10">
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="mb-4 ml-2">
          <Link
            href="/book_listing"
            className="inline-flex items-center gap-2 text-[#8a8a8a] hover:text-[#bc8a5f] transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Catalog
          </Link>
        </div>

        <div className="w-full p-6 md:p-8 rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-lg shadow-xl shadow-stone-200/50">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4a4a4a] mb-6 border-b border-[#a3b18a]/20 pb-4">
            {safeListing.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-3">
              {safeListing.photos[0] ? (
                <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg shadow-stone-300/50 border border-white/50">
                  <img
                    src={safeListing.photos[0]}
                    alt={safeListing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[3/4] rounded-2xl bg-[#e2d9c8]/50 flex items-center justify-center border border-white/50">
                  <span className="text-6xl opacity-50">📖</span>
                </div>
              )}

              {safeListing.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {safeListing.photos.slice(1).map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden border border-white/50 cursor-pointer hover:ring-2 hover:ring-[#bc8a5f] transition-all shadow-sm"
                    >
                      <img
                        src={photo}
                        alt={`${safeListing.title} view ${i + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col h-full">
              <div className="flex-grow space-y-5">
                <div>
                  <h2 className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider mb-3">
                    Book Details
                  </h2>
                  <div className="bg-white/50 rounded-2xl p-5 border border-[#a3b18a]/30 shadow-sm space-y-3 text-[15px]">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#8a8a8a] font-medium">Author:</span>
                      <span className="col-span-2 font-semibold text-[#4a4a4a]">
                        {safeListing.author}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#8a8a8a] font-medium">Category:</span>
                      <span className="col-span-2 text-[#4a4a4a]">{safeListing.category}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#8a8a8a] font-medium">Condition:</span>
                      <span className="col-span-2 text-[#4a4a4a] capitalize">
                        {safeListing.condition.replace("_", " ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#8a8a8a] font-medium">ISBN:</span>
                      <span className="col-span-2 text-[#4a4a4a]">{safeListing.isbn}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#8a8a8a] font-medium">Listed On:</span>
                      <span className="col-span-2 text-[#4a4a4a]">
                        {safeListing.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-[#8a8a8a] font-medium">Posted by:</span>

                      <div className="col-span-2 flex items-center gap-3">
                        <img
                          src={
                            safeListing.user.customImage ||
                            safeListing.user.image ||
                            "/default-avatar.png"
                          }
                          alt={safeListing.user.name || "User"}
                          className="w-8 h-8 rounded-full object-cover border border-white/60"
                        />

                        <Link
                          href={`/profile/${safeListing.user.id}`}
                          className="font-semibold text-[#4a4a4a] hover:text-[#bc8a5f] transition-colors"
                        >
                          {safeListing.user.name || "Anonymous User"}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 pt-2 mt-1 border-t border-[#a3b18a]/20">
                      <div className="mt-2">
                        <FavoriteButton bookId={safeListing.id} initialIsFavorited={initialIsFavorited} variant="text" />
                      </div>
                    </div>
                  </div>
                </div>

                {safeListing.description && (
                  <div>
                    <h2 className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider mb-2">
                      Description
                    </h2>
                    <p className="text-[#5c5c5c] leading-relaxed bg-white/40 p-4 rounded-2xl border border-white/50 italic shadow-inner">
                      "{safeListing.description}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons — always same row, same height */}
              {!isOwner && (
                <div className="pt-5 mt-5 border-t border-[#a3b18a]/20">
                  <div className="flex flex-row items-stretch gap-3">
                    {/* Borrow — wrapped so it can stretch */}
                    <div className="flex-1">
                      <BorrowModal
                        title={safeListing.title}
                        lender={safeListing.user}
                        bookId={safeListing.id}
                      />
                    </div>

                    {/* Send a message */}
                    <form action={startConversation} className="flex-1">
                      <button
                        type="submit"
                        className="w-full h-full min-h-[56px] px-5 rounded-full border-2 border-[#bc8a5f] text-[#bc8a5f] hover:bg-[#bc8a5f] hover:text-white font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h8M8 14h5m-9 7l2.5-2.5A2 2 0 013 17h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10l-2 4z"
                          />
                        </svg>
                        Send a message
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}