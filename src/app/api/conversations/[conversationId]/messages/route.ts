import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

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

  return NextResponse.json({
    messages: conversation.messages,
    otherUserLastReadAt: otherParticipant?.lastReadAt?.toISOString() ?? null,
  });
}