import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrismaClient, RequestStatus } from "@prisma/client";
import AcceptRejectRequest from "@/components/AcceptRejectRequest";

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
      borrower: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, photos: true } },
    },
  });

  return (
    <main className="min-h-screen p-6 md:p-10 bg-[#f2ece4]">
      <h1 className="text-3xl font-bold mb-6">Borrow Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">No borrow requests yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <AcceptRejectRequest key={req.id} request={req} />
          ))}
        </div>
      )}
    </main>
  );
}