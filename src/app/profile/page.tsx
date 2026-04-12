import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfileRedirect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no one is logged in, send them to sign-in
  if (!session?.user?.email) {
    redirect("/sign-in/");
  }

  // Fetch the logged-in user's ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true } 
  });

  if (!user) {
    redirect("/sign-in/");
  }

  // Redirect to their specific profile page
  redirect(`/profile/${user.id}`);
}