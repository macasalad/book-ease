import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";


export async function PUT(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
  

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { name, bio, customImage } = await req.json();

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name,
      bio,
      customImage,
    },
  });

  return NextResponse.json(updatedUser);
}