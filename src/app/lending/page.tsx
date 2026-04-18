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
    <main className="min-h-screen overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] relative font-sans">
      
      {/* Decorative Background Circles */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#4a4a4a] mb-8">Lending Dashboard</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#4a4a4a]">
            <span className="w-2.5 h-2.5 bg-[#bc8a5f] rounded-full shadow-sm"></span>
            Borrow Requests ({requests.length})
          </h2>

          {requests.length === 0 ? (
            <div className="bg-white/40 border border-white/60 p-8 rounded-[1.5rem] shadow-sm backdrop-blur-md text-center">
              <p className="text-[#8a8a8a]">You don't have any borrow requests yet.</p>
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