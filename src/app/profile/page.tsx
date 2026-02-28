import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "../components/SignOutButton";
import { BookCarousel } from "../components/BookCarousel"; 

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
    const dummyBooks = [1, 2, 3, 4, 5, 6]; 

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-x-hidden relative font-sans">
            {/* 1. Top Navigation Bar */}
              <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-md">
                  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[15px] font-medium">
                      {/* Navigation Links */}
                      <div className="flex space-x-10 text-gray-400">
                          <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
                          <Link href="/listing" className="hover:text-blue-400 transition-colors">Listing</Link>
                          <Link href="/catalog" className="hover:text-blue-400 transition-colors">Catalog</Link>
                          <Link href="/borrowing" className="hover:text-blue-400 transition-colors">Borrowing</Link>
                          <Link href="/lending" className="hover:text-blue-400 transition-colors">Lending</Link>
                          <Link href="/messages" className="hover:text-blue-400 transition-colors">Messages</Link>
                      </div>

                      {/* User Actions */}
                      <div className="flex space-x-8 items-center">
                          <Link 
                              href="/profile" 
                              className="text-white font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full"
                          >
                              My Account
                          </Link>
                          <div className="opacity-80 hover:opacity-100 transition-opacity">
                              <SignOutButton />
                          </div>
                      </div>
                  </div>
              </nav>

            {/* Background Decorative Circles (Auth Theme) */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* 2. Profile Header Section (Wireframe Layout) */}
                <section className="flex flex-col md:flex-row gap-12 mb-16 items-center md:items-start">
                    {/* Large Profile Picture Glass Container */}
                    <div className="relative group shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-30 h-30 md:w-50 md:h-50 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl flex items-center justify-center">
                            {/* The "X" Placeholder from wireframe if no image */}
                            {!displayImage ? (
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <div className="absolute w-full h-0.5 bg-white rotate-45"></div>
                                    <div className="absolute w-full h-0.5 bg-white -rotate-45"></div>
                                </div>
                            ) : null}
                            <img
                                src={displayImage}
                                alt="Profile"
                                className="w-full h-full object-cover p-1 rounded-full relative z-10"
                            />
                        </div>
                    </div>

                    {/* Bio and Info Glass Container */}
                    <div className="flex-1 w-full max-w-2xl">
                        <div className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl space-y-6">
                            <h1 className="text-4xl font-bold tracking-tight">User Profile</h1>
                            
                            <div className="space-y-1">
                                <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Display Name</label>
                                <p className="text-2xl font-medium text-white">{user.name || "Anonymous User"}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Bio</label>
                                <div className="w-full min-h-[120px] p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-300 leading-relaxed italic">
                                    {user.bio || "No bio yet. Share a bit about your reading journey!"}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Link
                                    href="/profile/edit"
                                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Book Carousels (Wireframe Layout) */}
              {/*
                <div className="space-y-12">
                    <BookCarousel 
                        title={`Books Lent: ${user.lentBooks?.length || 0}`} 
                        items={dummyBooks} 
                    />
                    <BookCarousel 
                        title={`Books Borrowed: ${user.borrowedBooks?.length || 0}`} 
                        items={dummyBooks} 
                    />
                </div>*/}
            </div>
        </main>
    );
}