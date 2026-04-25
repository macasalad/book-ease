"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; 
import { SignOutButton } from "@/components/SignOutButton";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const pathname = usePathname(); 

  const hiddenRoutes = ["/sign-in", "/sign-up"];
  const isHiddenRoute = hiddenRoutes.includes(pathname);

  useEffect(() => {
    if (!session) return;

    let active = true;
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/messages/unread-count", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setUnreadCount(data.unreadCount || 0);
      } catch {
        // ignore errors
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [session]);

  if (isHiddenRoute || isPending || !session) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#a3b18a]/30 bg-white/60 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-[15px] font-medium">
        
        <div className="flex items-center lg:gap-8 gap-4 text-[#8a8a8a]">
          
          <Link href="/dashboard" className="text-2xl font-extrabold tracking-tight text-[#4a4a4a] hover:opacity-80 transition-opacity mr-4">
            Book<span className="text-[#bc8a5f]">Ease</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="px-4 py-2 rounded-full hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold">
              Home
            </Link>
            <Link href="/book_listing" className="px-4 py-2 rounded-full hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold">
              Listing
            </Link>
<<<<<<< HEAD
            <Link href="/favorites" className="px-4 py-2 rounded-full hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold">
=======
            <Link href="/profile/favorites" className="px-4 py-2 rounded-full hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold">
>>>>>>> f27dc47fbc561ae94ff31e45c3d459e215427ae3
              Favorites
            </Link>
            <Link href="/borrowing" className="px-4 py-2 rounded-full hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold">
              Borrowing
            </Link>
            <Link href="/lending" className="px-4 py-2 rounded-full hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold">
              Lending
            </Link>
            <Link
              href="/messages"
              className="relative px-4 py-2 rounded-full hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold"
            >
              Messages
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#bc8a5f] text-white text-[10px] font-bold shadow-sm ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="px-4 py-2 rounded-full text-[#4a4a4a] hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold"
          >
            My Account
          </Link>
          
          <div className="px-4 py-2 rounded-full text-[#4a4a4a] hover:bg-white/80 hover:text-[#bc8a5f] hover:shadow-sm transition-all duration-300 font-bold">
            <SignOutButton />
          </div>
        </div>

      </div>
    </nav>
  );
}