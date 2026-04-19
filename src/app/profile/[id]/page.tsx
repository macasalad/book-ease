import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ProfileProps {
  params: Promise<{ id: string }>
}

export default async function UserProfile({ params }: ProfileProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  
  // Show 404 page if URL parameter does not resolve to a valid id
  if (!rawId) {
    return notFound();
  }

  // Decode encoded URL characters (e.g. %7C back to |)
  const id = decodeURIComponent(rawId);

  // Fetch user profile that has the id in the URL
  const profileUser = await prisma.user.findUnique({
    where: { id: id },
    include: {
      // lentBooks: true, 
      // borrowedBooks: true,
    }
  });

  // Show 404 page if no user exists with this ID in the database
  if (!profileUser) {
    return notFound();
  }

  // Get the current session 
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Determine if the current logged-in user is viewing their own profile
  let isOwnProfile = false;
  if (session?.user?.email) {
    const loggedInUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    isOwnProfile = loggedInUser?.id === profileUser.id;
  }

  const displayImage = profileUser.customImage || profileUser.image || "/default-avatar.png";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-x-hidden relative font-sans">

      {/* Background Decorative Circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {/* Profile Header Section */}
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
              <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">
                {isOwnProfile ? "My Profile" : `${profileUser.name || "User"}'s Profile`}
              </h1>
              
              <div className="space-y-1">
                <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider">Display Name</label>
                <p className="text-2xl font-medium text-[#4a4a4a]">{profileUser.name || "Anonymous User"}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider">Bio</label>
                <div className="w-full min-h-[120px] p-5 bg-white/50 border border-[#a3b18a]/30 rounded-2xl text-[#5c5c5c] leading-relaxed italic">
                  {profileUser.bio ? (
                    // Show actual bio if it exists
                    profileUser.bio
                  ) : isOwnProfile ? (
                    // Show prompt if empty AND it's the user's own profile
                    "No bio yet. Share a bit about your reading journey!"
                  ) : (
                    // Show "No bio" message for visitors viewing an empty profile
                    "This user hasn't added a bio yet."
                  )}
                </div>
              </div>

              {/* Only show the Edit Profile button if looking at own profile */}
              {isOwnProfile && (
                <div className="flex gap-4 pt-2">
                  <Link
                    href="/profile/edit"
                    className="px-8 py-2.5 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20 active:scale-95"
                  >
                    Edit Profile
                  </Link>
                </div>
              )}

              {/* See other users' listings */}
              {!isOwnProfile && (
                <div className="flex gap-4 pt-2">
                  <Link
                    href={`/profile/${profileUser.id}/listings`}
                    className="px-8 py-2.5 bg-[#a3b18a] hover:bg-[#8fa17a] text-white font-bold rounded-full transition-all shadow-lg shadow-[#a3b18a]/20 active:scale-95"
                  >
                    See {profileUser.name || "User"}'s Listings
                  </Link>
                </div>
              )}

              {/* Send Message */}
              {!isOwnProfile && (
                <Link
                href={`/messages/start/${profileUser.id}`}
                className="px-8 py-2.5 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20 active:scale-95"
              >
                Send Message
              </Link>
              )}
              
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}