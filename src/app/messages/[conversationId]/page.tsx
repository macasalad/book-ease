import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "../../../../auth";
import { SignOutButton } from "../../components/SignOutButton";

const prisma = new PrismaClient();

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const currentUserId = session.user.id;
  const { conversationId } = await params;

  if (!conversationId) {
    redirect("/messages");
  }

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: currentUserId,
    },
    data: {
      lastReadAt: new Date(),
    },
  });

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: { userId: currentUserId },
      },
    },
    include: {
      participants: {
        select: {
          userId: true,
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
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
        },
      },
    },
  });

  if (!conversation) {
    redirect("/messages");
  }

  const safeConversation = conversation;
  const otherParticipant = safeConversation.participants.find(
    (participant) => participant.userId !== currentUserId
  );

  async function sendMessage(formData: FormData) {
    "use server";

    const currentSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!currentSession?.user?.id) {
      redirect("/sign-in");
    }

    const content = String(formData.get("content") ?? "").trim();

    if (!content) {
      redirect(`/messages/${conversationId}`);
    }

    const allowedConversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId: currentSession.user.id },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!allowedConversation || allowedConversation.participants.length !== 2) {
      redirect("/messages");
    }

    await prisma.message.create({
      data: {
        conversationId,
        senderId: currentSession.user.id,
        content,
      },
    });

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: currentSession.user.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    redirect(`/messages/${conversationId}`);
  }

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

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-6">
          <Link
            href="/messages"
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
            Back to Messages
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-lg shadow-xl shadow-stone-200/50 overflow-hidden">
          <div className="flex items-center gap-4 border-b border-[#a3b18a]/20 px-6 py-5 bg-white/30">
            <div className="h-14 w-14 overflow-hidden rounded-full border border-white/60 bg-[#e2d9c8]/50 shadow-sm flex items-center justify-center text-[#8a8a8a] font-bold">
              {otherParticipant?.user.customImage || otherParticipant?.user.image ? (
                <img
                  src={otherParticipant?.user.customImage || otherParticipant?.user.image || ""}
                  alt={otherParticipant?.user.name ?? "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {(otherParticipant?.user.name ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#4a4a4a]">
                {otherParticipant?.user.name ?? "Conversation"}
              </h1>
              <p className="text-sm text-[#8a8a8a] font-medium">
                Coordinate borrowing details here
              </p>
            </div>
          </div>

          <div className="px-6 py-6 bg-white/20">
            <div className="rounded-[1.5rem] border border-white/60 bg-white/30 backdrop-blur-md p-4 md:p-6 min-h-[420px] max-h-[520px] overflow-y-auto shadow-inner">
              {safeConversation.messages.length === 0 ? (
                <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#a3b18a]/20 text-3xl">
                    💬
                  </div>
                  <p className="text-lg font-semibold text-[#4a4a4a]">
                    No messages yet
                  </p>
                  <p className="mt-2 text-sm text-[#8a8a8a] max-w-md">
                    Start the conversation about borrowing arrangements here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeConversation.messages.map((message) => {
                    const isMine = message.senderId === currentUserId;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] px-4 py-3 shadow-sm ${
                            isMine
                              ? "bg-[#bc8a5f] text-white rounded-[1.5rem] rounded-br-md"
                              : "bg-white/70 text-[#4a4a4a] border border-white/60 rounded-[1.5rem] rounded-bl-md"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm md:text-[15px] leading-relaxed">
                            {message.content}
                          </p>
                          <p
                            className={`mt-2 text-[11px] ${
                              isMine ? "text-white/80" : "text-[#8a8a8a]"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <form action={sendMessage} className="mt-5 flex flex-col gap-4">
              <textarea
                name="content"
                placeholder="Type your message..."
                className="w-full rounded-[1.5rem] border border-white/60 bg-white/50 px-5 py-4 text-[#4a4a4a] placeholder:text-[#8a8a8a] outline-none focus:border-[#bc8a5f]/50 focus:ring-2 focus:ring-[#bc8a5f]/20 backdrop-blur-md min-h-[110px] resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20"
                >
                  Send message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}