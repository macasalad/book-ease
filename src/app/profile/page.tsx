import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "../components/SignOutButton";

export default async function Profile() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/sign-in/");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            // lentBooks: true, 
            // borrowedBooks: true,
        }
    });

    if (!user) return null;

    const displayImage = user.image || "/default-avatar.png";

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-x-hidden relative font-sans">
            {/* 1. Top Navigation Bar */}
            <nav className="sticky top-0 z-50 w-full border-b border-[#a3b18a]/20 bg-white/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[15px] font-medium">
                    {/* Navigation Links */}
                    <div className="flex space-x-10 text-[#8a8a8a]">
                        <Link href="/dashboard" className="hover:text-[#bc8a5f] transition-colors">Home</Link>
                        <Link href="/listing" className="hover:text-[#bc8a5f] transition-colors">Listing</Link>
                        <Link href="/catalog" className="hover:text-[#bc8a5f] transition-colors">Catalog</Link>
                        <Link href="/borrowing" className="hover:text-[#bc8a5f] transition-colors">Borrowing</Link>
                        <Link href="/lending" className="hover:text-[#bc8a5f] transition-colors">Lending</Link>
                        <Link href="/messages" className="hover:text-[#bc8a5f] transition-colors">Messages</Link>
                    </div>

                    {/* User Actions */}
                    <div className="flex space-x-8 items-center">
                        <Link 
                            href="/profile" 
                            className="text-[#4a4a4a] font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#bc8a5f] after:rounded-full"
                        >
                            My Account
                        </Link>
                        <div className="opacity-80 hover:opacity-100 transition-opacity">
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Background Decorative Circles */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                {/* 2. Profile Header Section */}
                <section className="flex flex-col md:flex-row gap-12 mb-16 items-center justify-center max-w-5xl mx-auto">
                    {/* Profile Picture Container */}
                    <div className="relative group shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#a3b18a] to-[#bc8a5f] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border border-white/60 bg-white/40 backdrop-blur-xl overflow-hidden shadow-2xl flex items-center justify-center">
                            {!displayImage ? (
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <div className="absolute w-full h-0.5 bg-[#4a4a4a] rotate-45"></div>
                                    <div className="absolute w-full h-0.5 bg-[#4a4a4a] -rotate-45"></div>
                                </div>
                            ) : null}
                            <img
                                src={displayImage}
                                alt="Profile"
                                className="w-full h-full object-cover p-1 rounded-full relative z-10"
                            />
                        </div>
                    </div>

                    {/* Bio and Info Container */}
                    <div className="flex-1 w-full">
                        <div className="p-8 md:p-10 rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-lg shadow-xl shadow-stone-200/50 space-y-6">
                            <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">User Profile</h1>
                            
                            <div className="space-y-1">
                                <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider">Display Name</label>
                                <p className="text-2xl font-medium text-[#4a4a4a]">{user.name || "Anonymous User"}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider">Bio</label>
                                <div className="w-full min-h-[120px] p-5 bg-white/50 border border-[#a3b18a]/30 rounded-2xl text-[#5c5c5c] leading-relaxed italic">
                                    {user.bio || "No bio yet. Share a bit about your reading journey!"}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Link
                                    href="/profile/edit"
                                    className="px-8 py-2.5 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20 active:scale-95"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}