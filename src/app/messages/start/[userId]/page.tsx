import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

interface StartPageProps {
  params: Promise<{ userId: string }>;
}

export default async function StartConversationPage({ params }: StartPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { userId: targetUserId } = await params;
  const currentUserId = session.user.id;

  if (currentUserId === targetUserId) {
    redirect("/profile");
  }

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: currentUserId } } },
        { participants: { some: { userId: targetUserId } } },
      ],
    },
    select: { id: true }
  });

  if (existingConversation) {
    redirect(`/messages/${existingConversation.id}`);
  }

  const newConversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: currentUserId },
          { userId: targetUserId },
        ],
      },
    },
    select: { id: true }
  });

  redirect(`/messages/${newConversation.id}`);
}