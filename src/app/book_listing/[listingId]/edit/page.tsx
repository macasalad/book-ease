import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import NewBookForm from "../../new_book/NewBookForm";

const prisma = new PrismaClient();

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) redirect("/sign-in");

  const { listingId } = await params;

  const listing = await prisma.bookListing.findFirst({
    where: {
      id: listingId,
      userId: session.user.id,
    },
  });

  if (!listing) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-hidden relative font-sans flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl relative z-10 my-10">
        <div className="mb-6 ml-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#8a8a8a] hover:text-[#bc8a5f] transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="w-full p-8 md:p-12 rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-lg shadow-xl shadow-stone-200/50">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">
              Edit Listing
            </h1>
            <p className="text-[#8a8a8a] mt-2 font-medium">
              Update your book details
            </p>
          </div>

          <NewBookForm mode="edit" listingId={listingId} initialListing={listing} />
        </div>
      </div>
    </main>
  );
}