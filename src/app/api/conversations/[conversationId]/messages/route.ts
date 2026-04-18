import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

type MessageItem =
  | {
      type: "divider";
      id: string;
      label: string;
      date: string;
    }
  | {
      type: "message";
      id: string;
      content: string;
      createdAt: string;
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
        date: current.createdAt.toISOString(),
      });
    }

    items.push({
      type: "message",
      id: current.id,
      content: current.content,
      createdAt: current.createdAt.toISOString(),
      senderId: current.senderId,
    });
  }

  return items;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      participants: {
        select: {
          userId: true,
          lastReadAt: true,
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
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: session.user.id,
    },
    data: {
      lastReadAt: new Date(),
    },
  });

  const otherParticipant = conversation.participants.find(
    (participant) => participant.userId !== session.user.id
  );

  const items = buildMessageItems(conversation.messages);

  return NextResponse.json({
    messages: items,
    otherUserLastReadAt: otherParticipant?.lastReadAt?.toISOString() ?? null,
  });
}