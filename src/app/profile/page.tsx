import { auth } from "../../../auth";
import { prisma} from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isErrored } from "stream";

export default async function Profile() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    
    if (!session?.user?.email) {
        redirect("/sign-in/");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) return null;

    const displayImage = user.customImage || user.image;

    return (
         <div className="max-w-2xl mx-auto py-10">
      <img
        src={displayImage || "/default-avatar.png"}
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover"
      />

      <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
      <p className="text-gray-500">{user.email}</p>

      <p className="mt-6">{user.bio || "No bio yet."}</p>

      <a
        href="/profile/edit"
        className="inline-block mt-6 px-4 py-2 bg-black text-white rounded"
      >
        Edit Profile
      </a>
    </div>
    );

}