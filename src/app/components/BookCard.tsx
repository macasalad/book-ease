import Link from "next/link";
import FavoriteButton from "./FavoriteButton";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author?: string | null;
    photos?: string[] | null;
    condition?: string | null;
    isBorrowed?: boolean;
    isFavorited?: boolean;
  };
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/book_listing/${book.id}`}
      className="group flex flex-col bg-white/40 border border-white/60 rounded-[1.5rem] p-4 hover:bg-white/60 hover:shadow-xl hover:shadow-[#bc8a5f]/20 transition-all backdrop-blur-md shadow-lg shadow-stone-200/30"
    >
      <div className="aspect-[3/4] w-full bg-[#e2d9c8]/50 rounded-xl overflow-hidden shadow-inner relative flex items-center justify-center border border-white/40 mb-4">
        {book.photos && book.photos[0] ? (
          <img
            src={book.photos[0]}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-4xl opacity-50">📖</span>
        )}
      </div>

      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#4a4a4a] group-hover:text-[#bc8a5f] transition-colors line-clamp-1">
            {book.title}
          </h3>
          <p className="text-sm text-[#8a8a8a] line-clamp-1 mt-1">
            {book.author || "Unknown Author"}
          </p>
        </div>

        <div className="mt-4 inline-block px-3 py-1.5 bg-[#a3b18a]/20 text-[#5a7d5a] text-xs font-bold uppercase tracking-wider rounded-full w-max">
          {book.condition ? book.condition.replace("_", " ") : "Available"}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {book.isBorrowed ? (
          <span className="px-3 py-1.5 bg-[#a3b18a]/20 text-[#7D1128] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            Borrowed
          </span>
        ) : (
          <span className="px-3 py-1.5 bg-[#a3b18a]/20 text-[#5a7d5a] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            Available
          </span>
        )}

        <div className="ml-auto -mr-2 -mt-1 -mb-1">
          <FavoriteButton bookId={book.id} initialIsFavorited={book.isFavorited || false} />
        </div>
      </div>
    </Link>
  );
}
