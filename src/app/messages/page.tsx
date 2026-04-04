import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "../../../auth";
import { SignOutButton } from "../components/SignOutButton";

const prisma = new PrismaClient();

export default async function MessagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const currentUserId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: currentUserId },
      },
    },
    include: {
      participants: {
        select: {
          userId: true,
          lastReadAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              customImage: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const inbox = conversations
    .filter((conversation) => conversation.participants.length === 2)
    .map((conversation) => {
      const otherParticipant = conversation.participants.find(
        (p) => p.userId !== currentUserId
      );

      const currentParticipant = conversation.participants.find(
        (p) => p.userId === currentUserId
      );

      const latestMessage = conversation.messages[0] ?? null;

      const unread =
        !!latestMessage &&
        latestMessage.senderId !== currentUserId &&
        (
          !currentParticipant?.lastReadAt ||
          new Date(latestMessage.createdAt) > new Date(currentParticipant.lastReadAt)
        );

      return {
        id: conversation.id,
        updatedAt: conversation.updatedAt,
        otherUser: otherParticipant?.user ?? null,
        latestMessage,
        unread,
      };
    });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-x-hidden relative font-sans">
      <nav className="sticky top-0 z-50 w-full border-b border-[#a3b18a]/20 bg-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[15px] font-medium">
          <div className="flex space-x-10 text-[#8a8a8a]">
            <Link href="/dashboard" className="hover:text-[#bc8a5f] transition-colors">
              Home
            </Link>
            <Link href="/listing" className="hover:text-[#bc8a5f] transition-colors">
              Listing
            </Link>
            <Link href="/catalog" className="hover:text-[#bc8a5f] transition-colors">
              Catalog
            </Link>
            <Link href="/borrowing" className="hover:text-[#bc8a5f] transition-colors">
              Borrowing
            </Link>
            <Link href="/lending" className="hover:text-[#bc8a5f] transition-colors">
              Lending
            </Link>
            <Link
              href="/messages"
              className="text-[#4a4a4a] font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#bc8a5f] after:rounded-full"
            >
              Messages
            </Link>
          </div>

          <div className="flex space-x-8 items-center">
            <Link
              href="/profile"
              className="hover:text-[#bc8a5f] transition-colors font-bold"
            >
              My Account
            </Link>
            <div className="opacity-80 hover:opacity-100 transition-opacity">
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="absolute top-40 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">
              Messages
            </h1>
            <p className="text-[#8a8a8a] mt-2 font-medium">
              Coordinate borrowing arrangements and keep track of your conversations
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-[#a3b18a]/30 bg-white/50 px-4 py-2 text-sm font-medium text-[#5a7d5a] backdrop-blur-md">
            {inbox.length} conversation{inbox.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-lg shadow-xl shadow-stone-200/50 p-6 md:p-8">
          {inbox.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/60 bg-white/40 p-10 text-center backdrop-blur-md shadow-lg shadow-stone-200/30">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#a3b18a]/20 text-3xl">
                💬
              </div>
              <p className="text-lg font-semibold text-[#4a4a4a]">
                No conversations yet
              </p>
              <p className="mt-2 text-sm text-[#8a8a8a]">
                When you message another user from a book listing, your conversation will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inbox.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className={`group block rounded-[1.5rem] border p-5 backdrop-blur-md transition-all shadow-lg shadow-stone-200/20 ${
                    conversation.unread
                      ? "border-[#a3b18a]/40 bg-[#f7f6f2]/80 hover:bg-white/80"
                      : "border-white/60 bg-white/40 hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/60 bg-[#e2d9c8]/50 shadow-sm flex items-center justify-center text-[#8a8a8a] font-bold">
                        {conversation.otherUser?.customImage || conversation.otherUser?.image ? (
                          <img
                            src={
                              conversation.otherUser?.customImage ||
                              conversation.otherUser?.image ||
                              ""
                            }
                            alt={conversation.otherUser?.name ?? "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {(conversation.otherUser?.name ?? "U").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`truncate text-base ${
                              conversation.unread
                                ? "font-bold text-[#4a4a4a]"
                                : "font-semibold text-[#4a4a4a]"
                            }`}
                          >
                            {conversation.otherUser?.name ?? "Unknown user"}
                          </p>

                          {conversation.unread && (
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#bc8a5f]" />
                          )}
                        </div>

                        <p
                          className={`mt-1 truncate text-sm ${
                            conversation.unread ? "text-[#5c5c5c] font-medium" : "text-[#8a8a8a]"
                          }`}
                        >
                          {conversation.latestMessage?.content ?? "No messages yet"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-[#8a8a8a]">
                        {new Date(conversation.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}