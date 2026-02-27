import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "../../../../auth";
import { PrismaClient } from "@/generated/prisma/client";

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
    },
  });

  if (!listing) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-all"
        >
          ← Back to Catalog
        </Link>
        <h1 className="text-3xl font-bold flex-1">{listing.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* gallery */}
        <div className="space-y-4">
          {listing.photos[0] && (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="w-full aspect-3/4 rounded-lg object-cover shadow-lg"
            />
          )}
          {listing.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.photos.slice(1).map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${listing.title} ${i + 1}`}
                  className="aspect-square rounded object-cover cursor-pointer hover:ring-2 hover:ring-white/50"
                />
              ))}
            </div>
          )}
        </div>

        {/* details */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium">Author:</span> {listing.author}</div>
              <div><span className="font-medium">Category:</span> {listing.category}</div>
              <div><span className="font-medium">Condition:</span> {listing.condition}</div>
              <div><span className="font-medium">ISBN:</span> {listing.isbn}</div>
              <div><span className="font-medium">Listed:</span> {listing.createdAt.toLocaleDateString()}</div>
            </div>
          </div>

          {listing.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* buttons */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button className="flex-1 rounded border border-white/10 bg-white/5 px-6 py-3 hover:bg-white/10 transition-all font-medium">
              PLACEHOLDER
            </button>
            <button className="px-6 py-3 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
              PLACEHOLDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
