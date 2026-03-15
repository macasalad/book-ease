// app/borrowing/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import ReturnBookButton from "@/components/ReturnBookButton";

const prisma = new PrismaClient();

export default async function BorrowingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;

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
      book: { 
        select: { 
          id: true, 
          title: true, 
          author: true,
          photos: true,
          condition: true,
          user: { // The lender/owner
            select: { 
              id: true,
              name: true, 
              email: true 
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

  return (
    <main className="min-h-screen p-6 md:p-10 bg-[#f2ece4]">
      <h1 className="text-3xl font-bold mb-8">My Borrowed Books</h1>

      {/* Currently Borrowed Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Currently Borrowed ({activeBorrows.length})
        </h2>

        {activeBorrows.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-2xl shadow-sm">
            You haven't borrowed any books yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBorrows.map((borrow) => (
              <div key={borrow.id} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex gap-4">
                  {/* Book Image */}
                  <div className="w-24 h-32 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    {borrow.book.photos[0] ? (
                      <img
                        src={borrow.book.photos[0]}
                        alt={borrow.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100 text-4xl">
                        📚
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{borrow.book.title}</h3>
                    <p className="text-gray-600">by {borrow.book.author}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Lent by: {borrow.book.user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Borrowed on: {new Date(borrow.borrowedAt).toLocaleDateString()}
                    </p>
                    
                    {/* Return Button */}
                    <div className="mt-4">
                      <ReturnBookButton 
                        borrowId={borrow.id}
                        bookId={borrow.book.id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Pending Requests ({pendingRequests.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-yellow-500">
                <div className="flex gap-4">
                  <div className="w-20 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    {request.book.photos[0] ? (
                      <img
                        src={request.book.photos[0]}
                        alt={request.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100">
                        📖
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{request.book.title}</h3>
                    <p className="text-sm text-gray-600">by {request.book.author}</p>
                    <p className="text-sm text-gray-500">Owner: {request.book.user.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
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
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            History
          </h2>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="space-y-4">
              {borrowHistory.map((borrow) => (
                <div key={borrow.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-12 h-16 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                    {borrow.book.photos[0] ? (
                      <img
                        src={borrow.book.photos[0]}
                        alt={borrow.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100">
                        📖
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{borrow.book.title}</h4>
                    <p className="text-sm text-gray-600">by {borrow.book.author}</p>
                    <p className="text-xs text-gray-500">
                      From {borrow.book.user.name} • 
                      Borrowed: {new Date(borrow.borrowedAt).toLocaleDateString()} • 
                      Returned: {new Date(borrow.returnedAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}