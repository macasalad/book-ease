import { auth } from "@/../auth";
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditProfileForm from "./EditProfileForm";

export default async function EditProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) return null;

    return <EditProfileForm user={user} />;
}