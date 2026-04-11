import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ unreadCount: 0 }, { status: 200 });
  }

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
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          createdAt: true,
          senderId: true,
        },
      },
    },
  });

  const unreadCount = conversations.reduce((count, conversation) => {
    const currentParticipant = conversation.participants.find(
      (p) => p.userId === currentUserId
    );

    const latestMessage = conversation.messages[0];

    const unread =
      !!latestMessage &&
      latestMessage.senderId !== currentUserId &&
      (!currentParticipant?.lastReadAt ||
        new Date(latestMessage.createdAt) > new Date(currentParticipant.lastReadAt));

    return unread ? count + 1 : count;
  }, 0);

  return NextResponse.json({ unreadCount });
}