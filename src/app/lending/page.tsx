import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AcceptRejectRequest from "@/components/AcceptRejectRequest";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function LendingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;

  const requests = await prisma.borrowRequest.findMany({
    where: { lenderId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      returnDate: true,
      borrower: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          customImage: true,
        }
      },
      book: {
        select: {
          id: true,
          title: true,
          photos: true,
          author: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              customImage: true,
            }
          }
        }
      }
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] relative font-sans pb-12">
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex justify-between items-end mb-4 border-b border-[#a3b18a]/30 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">
              My Lent Books
            </h1>
            <p className="text-[#8a8a8a] mt-2 font-medium">
              Lending History
            </p>
          </div>
        </div>
        
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#4a4a4a]">
            <span className="w-2.5 h-2.5 bg-[#bc8a5f] rounded-full shadow-sm"></span>
            Borrow Requests ({requests.length})
          </h2>

          {requests.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-stone-200/50">
            <span className="text-6xl mb-6 block">📚</span>
            <p className="text-xl font-semibold text-[#4a4a4a] mb-2">
              You haven't received any borrow requests yet.
            </p>
            <p className="text-[#8a8a8a] mb-6">
              List more books other users can borrow.
            </p>
            <Link
              href="/book_listing/new_book"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20"
            >
              List a Book
            </Link>
          </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {requests.map((req) => (
                <AcceptRejectRequest key={req.id} request={req} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}