import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "../components/SignOutButton";
import { auth } from "../../../auth";
import { headers } from "next/headers";

type Listing = { 
  id: string; 
  title: string; 
  photos: string[] | null;
};

export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // currently set for development
  const res = await fetch("http://localhost:3000/api/book_listing", {
    cache: "no-store",
  });
  const data = (await res.json()) as { items: Listing[] };

return (
        <main className="min-h-screen bg-white text-black font-sans">
            {/* 1. Top Gray Navigation Bar (Version B style) */}
            <nav className="bg-[#e0e0e0] w-full">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-[15px] font-medium text-gray-700">
                    <div className="flex space-x-10">
                        <Link href="/dashboard" className="hover:text-black">Home</Link>
                        <Link href="/listing" className="hover:text-black">Listing</Link>
                        <Link href="/catalog" className="hover:text-black">Catalog</Link>
                        <Link href="/borrowing" className="hover:text-black">Borrowing</Link>
                        <Link href="/lending" className="hover:text-black">Lending</Link>
                        <Link href="/messages" className="hover:text-black">Messages</Link>
                    </div>
                    <div className="flex space-x-8 items-center">
                        <Link href="/profile" className="hover:text-black">My Account</Link>
                        <SignOutButton />
                    </div>
                </div>
            </nav>

            {/* 2. Logo and Search Bar Header (Combined Style) */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold tracking-tight text-black">BookEase</h1>
                    <p className="text-sm text-gray-500">Catalog</p>
                </div>
                
                <div className="flex items-center flex-1 max-w-2xl ml-16 justify-end space-x-3">
                    {/* Add Book Button (Merged from Version A) */}
                    <Link
                        href="/book_listing/new_book"
                        className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all mr-4"
                    >
                        + Add Book
                    </Link>

                    {/* Pill-shaped Search Input (Version B) */}
                    <div className="flex-1 flex items-center bg-[#f0f1f2] rounded-full px-4 py-2 shadow-inner max-w-md">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search catalog..."
                            className="bg-transparent border-none outline-none w-full text-gray-900 placeholder-gray-500 font-medium"
                        />
                    </div>
                    
                    {/* Filters Button (Version B) */}
                    <button className="bg-[#e0e0e0] text-gray-800 font-medium px-6 py-2 rounded-full flex items-center space-x-2 hover:bg-gray-300 transition-colors">
                        <span>Filters</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 3. Main Grid Content (Version A Logic with Version B Wireframe Styling) */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {data.items.map((b) => (
                        <Link
                            key={b.id}
                            href={`/book_listing/${b.id}`}
                            className="group block"
                        >
                            {/* Book Cover Placeholder/Image (Wireframe X Style) */}
                            <div className="aspect-[3/4] w-full bg-[#d9d9d9] border-2 border-gray-300 relative flex items-center justify-center overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-all">
                                {b.photos && b.photos[0] ? (
                                    <img 
                                        src={b.photos[0]} 
                                        alt={b.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <>
                                        {/* The "X" from wireframe placeholders */}
                                        <div className="absolute w-[150%] h-0.5 bg-gray-400 rotate-[55deg]"></div>
                                        <div className="absolute w-[150%] h-0.5 bg-gray-400 -rotate-[55deg]"></div>
                                        <span className="relative z-10 text-4xl">📖</span>
                                    </>
                                )}
                            </div>
                            <div className="mt-3">
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 truncate">{b.title}</h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Available</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
