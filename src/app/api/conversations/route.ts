import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const body = await req.json();
    const targetUserId = body?.targetUserId?.trim();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { error: "You cannot message yourself" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, image: true, customImage: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    const candidateConversations = await prisma.conversation.findMany({
      where: {
        AND: [
          {
            participants: {
              some: { userId: currentUserId },
            },
          },
          {
            participants: {
              some: { userId: targetUserId },
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
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

    const existingConversation = candidateConversations.find((conversation) => {
      if (conversation.participants.length !== 2) return false;

      const ids = conversation.participants.map((p) => p.userId).sort();
      const expected = [currentUserId, targetUserId].sort();

      return ids[0] === expected[0] && ids[1] === expected[1];
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation, { status: 200 });
    }

    const createdConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            {
              userId: currentUserId,
              lastReadAt: new Date(),
            },
            {
              userId: targetUserId,
            },
          ],
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
    });

    return NextResponse.json(createdConversation, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
            user: {
              select: {
                id: true,
                name: true,
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

    return NextResponse.json(inbox, { status: 200 });
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}