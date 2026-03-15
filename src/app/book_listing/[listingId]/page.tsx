import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "../../../../auth";
import { PrismaClient } from "@prisma/client";
import BorrowModal from "../components/BorrowModal";

const prisma = new PrismaClient();

export default async function BookDetailPage({ 
  params 
}: { 
  params: Promise<{ listingId: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { listingId } = await params;

  if (!listingId) {
    redirect("/dashboard");
  }

  // fetch single book listing
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
      user: true
    },
  });

  if (!listing) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-x-hidden relative font-sans p-6 md:p-10">
      {/* Background Decorative Circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        
        {/* Back Link */}
        <div className="mb-6 ml-2">
            <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 text-[#8a8a8a] hover:text-[#bc8a5f] transition-colors font-medium"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Catalog
            </Link>
        </div>

        {/* Main Glass Container */}
        <div className="w-full p-8 md:p-12 rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-lg shadow-xl shadow-stone-200/50">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4a4a4a] mb-10 border-b border-[#a3b18a]/20 pb-6">
                {listing.title}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                {listing.photos[0] ? (
                    <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg shadow-stone-300/50 border border-white/50">
                        <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full aspect-[3/4] rounded-2xl bg-[#e2d9c8]/50 flex items-center justify-center border border-white/50">
                        <span className="text-6xl opacity-50">📖</span>
                    </div>
                )}
                
                {/* Thumbnail Grid */}
                {listing.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                    {listing.photos.slice(1).map((photo, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/50 cursor-pointer hover:ring-2 hover:ring-[#bc8a5f] transition-all shadow-sm">
                            <img
                                src={photo}
                                alt={`${listing.title} view ${i + 2}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                    </div>
                )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col h-full">
                    <div className="flex-grow space-y-8">
                        <div>
                            <h2 className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider mb-4">Book Details</h2>
                            <div className="bg-white/50 rounded-2xl p-6 border border-[#a3b18a]/30 shadow-sm space-y-4 text-[15px]">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-[#8a8a8a] font-medium">Author:</span> 
                                    <span className="col-span-2 font-semibold text-[#4a4a4a]">{listing.author}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-[#8a8a8a] font-medium">Category:</span> 
                                    <span className="col-span-2 text-[#4a4a4a]">{listing.category}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-[#8a8a8a] font-medium">Condition:</span> 
                                    <span className="col-span-2 text-[#4a4a4a] capitalize">{listing.condition.replace('_', ' ')}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-[#8a8a8a] font-medium">ISBN:</span> 
                                    <span className="col-span-2 text-[#4a4a4a]">{listing.isbn}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-[#8a8a8a] font-medium">Listed On:</span> 
                                    <span className="col-span-2 text-[#4a4a4a]">{listing.createdAt.toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {listing.description && (
                            <div>
                                <h2 className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider mb-3">Description</h2>
                                <p className="text-[#5c5c5c] leading-relaxed bg-white/40 p-5 rounded-2xl border border-white/50 italic shadow-inner">
                                    "{listing.description}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-8 mt-8 border-t border-[#a3b18a]/20">
                    <BorrowModal
                        title={listing.title}
                        lender={listing.user}
                        bookId={listing.id}
                        />
                        <button className="px-6 py-4 rounded-full border-2 border-[#a3b18a] text-[#5a7d5a] hover:bg-[#a3b18a] hover:text-white font-bold transition-all flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Favorite
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}