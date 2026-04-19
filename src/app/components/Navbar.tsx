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
    <nav className="sticky top-0 z-50 w-full border-b border-[#a3b18a]/20 bg-white/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[15px] font-medium">
        
        <div className="flex space-x-10 items-center text-[#8a8a8a]">
          
          <Link href="/dashboard" className="text-xl font-extrabold tracking-tight text-[#4a4a4a] hover:opacity-80 transition-opacity">
            Book<span className="text-[#bc8a5f]">Ease</span>
          </Link>

          <Link href="/dashboard" className="hover:text-[#bc8a5f] transition-colors">
            Home
          </Link>
          <Link href="/book_listing" className="hover:text-[#bc8a5f] transition-colors">
            Listing
          </Link>
          <Link href="/borrowing" className="hover:text-[#bc8a5f] transition-colors">
            Borrowing
          </Link>
          <Link href="/lending" className="hover:text-[#bc8a5f] transition-colors">
            Lending
          </Link>
          <Link
            href="/messages"
            className="relative hover:text-[#bc8a5f] transition-colors font-medium"
          >
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-5 inline-flex min-w-[20px] h-5 px-1 items-center justify-center rounded-full bg-[#bc8a5f] text-white text-[11px] font-bold leading-none">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex space-x-8 items-center">
          <Link
            href="/profile"
            className="hover:text-[#bc8a5f] transition-colors font-bold"
          >
            My Account
          </Link>
          <div className="opacity-80 hover:opacity-100 transition-opacity">
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}