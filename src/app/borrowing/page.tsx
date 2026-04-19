// app/borrowing/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import ReturnBookButton from "@/components/ReturnBookButton";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

const prisma = new PrismaClient();

export default async function BorrowingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const now = new Date();

  // Fetch active borrow records where current user is the borrower
  const activeBorrows = await prisma.borrowRecord.findMany({
    where: { 
      borrowerId: userId,
      returnedAt: null // Only currently borrowed books
    },
    orderBy: { borrowedAt: "desc" },
    select: {
      id: true,
      borrowedAt: true,
      dueAt: true,
      book: { 
        select: { 
          id: true, 
          title: true, 
          author: true,
          photos: true,
          condition: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              customImage: true,
            }
          }
        } 
      },
    },
  });

  // Fetch borrowing history (returned books)
  const borrowHistory = await prisma.borrowRecord.findMany({
    where: { 
      borrowerId: userId,
      NOT: { returnedAt: null }
    },
    orderBy: { returnedAt: "desc" },
    take: 10, // Limit history to last 10
    select: {
      id: true,
      borrowedAt: true,
      returnedAt: true,
      dueAt: true,
      book: { 
        select: { 
          id: true, 
          title: true, 
          author: true,
          photos: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              customImage: true,
            }
          }
        } 
      },
    },
  });

  // Fetch pending requests made by this user
  const pendingRequests = await prisma.borrowRequest.findMany({
    where: { 
      borrowerId: userId,
      status: "PENDING"
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      book: { 
        select: { 
          id: true, 
          title: true, 
          author: true,
          photos: true,
          user: { 
            select: { name: true } 
          }
        } 
      },
    },
  });

  const getDueStatus = (dueAt: Date | null) => {
    if (!dueAt) return { text: "No due date", color: "text-[#8a8a8a]" };

    const dueDate = new Date(dueAt);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`, 
        color: "text-red-600 font-bold animate-pulse" 
      };
    } else if (diffDays === 0) {
      return { text: "Due today!", color: "text-orange-600 font-bold" };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`, color: "text-amber-600 font-medium" };
    } else {
      return { text: `Due in ${diffDays} days`, color: "text-[#5c5c5c]" };
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] relative font-sans pb-12">
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#4a4a4a] mb-8">My Borrowed Books</h1>

        {/* Currently Borrowed Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#4a4a4a]">
            <span className="w-2.5 h-2.5 bg-[#5a7d5a] rounded-full shadow-sm"></span>
            Currently Borrowed ({activeBorrows.length})
          </h2>

          {activeBorrows.length === 0 ? (
            <p className="text-[#8a8a8a] bg-white/40 border border-white/60 p-6 rounded-[1.5rem] shadow-sm backdrop-blur-md">
              You haven't borrowed any books yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activeBorrows.map((borrow) => (
                <div key={borrow.id} className="bg-white/40 border border-white/60 rounded-[1.5rem] p-5 shadow-lg shadow-stone-200/30 backdrop-blur-md hover:bg-white/60 transition-all flex flex-col sm:flex-row gap-5">
                  {/* Standardized Book Image */}
                  <div className="w-24 h-32 rounded-xl overflow-hidden border border-white/50 shadow-inner bg-[#e2d9c8]/50 shrink-0 flex items-center justify-center">
                    {borrow.book.photos[0] ? (
                      <img src={borrow.book.photos[0]} alt={borrow.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl opacity-50">📖</span>
                    )}
                  </div>
                  {/* Standardized Book Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#4a4a4a] leading-tight">{borrow.book.title}</h3>
                      <p className="text-sm text-[#8a8a8a]">by {borrow.book.author}</p>
                      <div className="mt-2 text-sm text-[#5c5c5c] space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Lent by:</span>

                        <Link
                          href={`/profile/${borrow.book.user.id}`}
                          className="flex items-center gap-2 hover:text-[#bc8a5f] transition-colors"
                        >
                          <img
                            src={
                              borrow.book.user.customImage ||
                              borrow.book.user.image ||
                              "/default-avatar.png"
                            }
                            className="w-6 h-6 rounded-full object-cover border border-white/60"
                            alt={borrow.book.user.name}
                          />

                          <span className="font-medium">
                            {borrow.book.user.name}
                          </span>
                        </Link>
                      </div>
                      <div className="space-y-0.5">
                        <p>
                          <span className="font-semibold">Borrowed:</span>{" "}
                          {new Date(borrow.borrowedAt).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-semibold">Return by:</span>{" "}
                          {borrow.dueAt
                            ? new Date(borrow.dueAt).toLocaleDateString()
                            : "No due date"}
                        </p>
                        <p>
                        {(() => {
                          const status = getDueStatus(borrow.dueAt);
                          return (
                            <p className={`text-xs ${status.color}`}>
                              {status.text}
                            </p>
                          );
                        })()}
                        </p>
                      </div>
                      
                      </div>
                    </div>
                    <div className="mt-3">
                      <ReturnBookButton borrowId={borrow.id} bookId={borrow.book.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <section className="mb-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#4a4a4a]">
              <span className="w-2.5 h-2.5 bg-[#bc8a5f] rounded-full shadow-sm"></span>
              Pending Requests ({pendingRequests.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white/40 border border-white/60 rounded-[1.5rem] p-5 shadow-lg shadow-stone-200/30 backdrop-blur-md hover:bg-white/60 transition-all flex flex-col sm:flex-row gap-5">
                  <div className="w-24 h-32 rounded-xl overflow-hidden border border-white/50 shadow-inner bg-[#e2d9c8]/50 shrink-0 flex items-center justify-center">
                    {request.book.photos[0] ? (
                      <img src={request.book.photos[0]} alt={request.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl opacity-50">📖</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#4a4a4a] leading-tight">{request.book.title}</h3>
                      <p className="text-sm text-[#8a8a8a]">by {request.book.author}</p>
                      <div className="mt-2 text-sm text-[#5c5c5c] space-y-0.5">
                        <p><span className="font-semibold">Owner:</span> {request.book.user.name}</p>
                        <p><span className="font-semibold">Requested:</span> {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1.5 bg-[#bc8a5f]/20 text-[#a47148] border border-[#bc8a5f]/30 text-xs font-bold uppercase tracking-wider rounded-full w-max">
                        Pending approval
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Borrowing History Section */}
        {borrowHistory.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#4a4a4a]">
              <span className="w-2.5 h-2.5 bg-[#a3b18a] rounded-full shadow-sm"></span>
              History
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {borrowHistory.map((borrow) => (
                <div key={borrow.id} className="bg-white/40 border border-white/60 rounded-[1.5rem] p-5 shadow-lg shadow-stone-200/30 backdrop-blur-md hover:bg-white/60 transition-all flex flex-col sm:flex-row gap-5">
                  <div className="w-24 h-32 rounded-xl overflow-hidden border border-white/50 shadow-inner bg-[#e2d9c8]/50 shrink-0 flex items-center justify-center">
                    {borrow.book.photos[0] ? (
                      <img src={borrow.book.photos[0]} alt={borrow.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl opacity-50">📖</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#4a4a4a] leading-tight">{borrow.book.title}</h3>
                      <p className="text-sm text-[#8a8a8a]">by {borrow.book.author}</p>
                      <div className="mt-2 text-sm text-[#5c5c5c] space-y-0.5">
                        <p><span className="font-semibold">From:</span> {borrow.book.user.name}</p>
                        <p><span className="font-semibold">Borrowed:</span> {new Date(borrow.borrowedAt).toLocaleDateString()}
                        <span className="font-semibold"> Returned:</span> {new Date(borrow.returnedAt!).toLocaleDateString()} </p>

                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1.5 bg-[#a3b18a]/20 text-[#5a7d5a] border border-[#a3b18a]/30 text-xs font-bold uppercase tracking-wider rounded-full w-max">
                        Returned
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}