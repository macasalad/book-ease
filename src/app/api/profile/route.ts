import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    // 1. Verify the session on the server
    const session = await auth.api.getSession({
        headers: await headers(),
    });
  
    // 2. Block unauthenticated requests
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Extract the updated fields from the client request
    const { name, bio, customImage } = await req.json();

    // 4. Update the user in the database
    // This is secure because it targets the database row matching the verified session email
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        bio,
        customImage,
      },
    });

    return NextResponse.json(updatedUser);
    
  } catch (error) {
    // 5. Catch and log any server or database errors
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}