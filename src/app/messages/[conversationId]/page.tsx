import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "../../../../auth";
import PollingConversation from "./PollingConversation";
import PageContainer from "../../components/PageContainer";

const prisma = new PrismaClient();

type MessageItem =
  | {
      type: "divider";
      id: string;
      label: string;
      date: Date;
    }
  | {
      type: "message";
      id: string;
      content: string;
      createdAt: Date;
      senderId: string;
    };

function formatDividerLabel(date: Date) {
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();

  const base = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(date);

  if (sameYear) return base;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildMessageItems(
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
  }>
): MessageItem[] {
  const items: MessageItem[] = [];

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;

    const currentDay = current.createdAt.toDateString();
    const prevDay = prev ? prev.createdAt.toDateString() : null;

    if (!prev || currentDay !== prevDay) {
      items.push({
        type: "divider",
        id: `divider-${current.createdAt.toISOString()}`,
        label: formatDividerLabel(current.createdAt),
        date: current.createdAt,
      });
    }

    items.push({
      type: "message",
      id: current.id,
      content: current.content,
      createdAt: current.createdAt,
      senderId: current.senderId,
    });
  }

  return items;
}

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

  const messageItems = buildMessageItems(safeConversation.messages);

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

    await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          conversationId,
          senderId: currentSession.user.id,
          content,
        },
      });

      await tx.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          lastMessageAt: new Date(),
        },
      });

      await tx.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: currentSession.user.id,
        },
        data: {
          lastReadAt: new Date(),
        },
      });
    });

    redirect(`/messages/${conversationId}`);
  }

  return (
    <PageContainer maxWidth="5xl" className="py-4 md:py-8">
      <div className="mb-6">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-[#8a8a8a] hover:text-[#bc8a5f] transition-colors font-medium ml-2"
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
          <Link
            href={`/profile/${otherParticipant?.user.id}`}
            className="h-14 w-14 overflow-hidden rounded-full border border-white/60 bg-[#e2d9c8]/50 shadow-sm flex items-center justify-center text-[#8a8a8a] font-bold hover:opacity-80 transition"
          >
            {otherParticipant?.user.customImage || otherParticipant?.user.image ? (
              <img
                src={
                  otherParticipant?.user.customImage ||
                  otherParticipant?.user.image ||
                  ""
                }
                alt={otherParticipant?.user.name ?? "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>
                {(otherParticipant?.user.name ?? "U").charAt(0).toUpperCase()}
              </span>
            )}
          </Link>

          <div>
            <Link
              href={`/profile/${otherParticipant?.user.id}`}
              className="text-2xl font-bold text-[#4a4a4a] hover:text-[#bc8a5f] transition-colors"
            >
              {otherParticipant?.user.name ?? "Conversation"}
            </Link>

            <p className="text-sm text-[#8a8a8a] font-medium">
              Coordinate borrowing details here
            </p>
          </div>
        </div>

        <div className="px-6 py-6 bg-white/20">
          <PollingConversation
            currentUserId={currentUserId}
            conversationId={conversationId}
            initialMessages={messageItems}
            initialOtherUserLastReadAt={otherParticipant?.lastReadAt?.toISOString() ?? null}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </PageContainer>
  );
}