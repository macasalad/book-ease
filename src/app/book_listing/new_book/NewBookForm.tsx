"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type FormState = {
  title: string;
  author: string;
  category: string;
  condition: string;
  isbn: string;
  description: string;
  photos: File[];
};

type SearchResult = {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  editions?: {
    docs?: Array<{
      isbn?: string[];
      key?: string;
      title?: string;
    }>;
  };
};

type BookListing = {
  id: string;
  title: string;
  author: string;
  category: string;
  condition: string;
  isbn: string | null;
  description: string | null;
  photos: string[];
};

type NewBookFormProps = {
  mode?: "create" | "edit";
  listingId?: string;
  initialListing?: BookListing;
};

const initialState: FormState = {
  title: "",
  author: "",
  category: "",
  condition: "",
  isbn: "",
  description: "",
  photos: [],
};

function cleanGenre(subjects: string[]): string {
  const cleanSubjects = subjects.filter((subject) => {
    const lower = subject.toLowerCase();

    if (lower.startsWith("series:")) return false;
    if (lower.startsWith("accessible book")) return false;
    if (lower.startsWith("protected daisy")) return false;
    if (lower.includes("_")) return false;
    if (subject.length > 40) return false;

    return true;
  });

  const preferredGenre =
    cleanSubjects.find((subject) => {
      const lower = subject.toLowerCase();

      return (
        lower.includes("fiction") ||
        lower.includes("fantasy") ||
        lower.includes("romance") ||
        lower.includes("mystery") ||
        lower.includes("thriller") ||
        lower.includes("horror") ||
        lower.includes("history") ||
        lower.includes("science") ||
        lower.includes("poetry") ||
        lower.includes("drama") ||
        lower.includes("adventure") ||
        lower.includes("classic") ||
        lower.includes("children") ||
        lower.includes("young adult") ||
        lower.includes("biography")
      );
    }) || cleanSubjects[0] || "";

  return preferredGenre;
}

function looksLikeISBN(value: string) {
  const cleaned = value.replace(/-/g, "").trim();
  return /^[0-9Xx-]+$/.test(value) && cleaned.length >= 10;
}

export default function NewBookForm({
  mode = "create",
  listingId,
  initialListing,
}: NewBookFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    initialListing
      ? {
          title: initialListing.title ?? "",
          author: initialListing.author ?? "",
          category: initialListing.category ?? "",
          condition: initialListing.condition ?? "",
          isbn: initialListing.isbn ?? "",
          description: initialListing.description ?? "",
          photos: [],
        }
      : initialState
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSearchingISBN, setIsSearchingISBN] = useState(false);
  const [isbnMessage, setIsbnMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const [titleResults, setTitleResults] = useState<SearchResult[]>([]);
  const [showTitleResults, setShowTitleResults] = useState(false);
  const [isSearchingTitles, setIsSearchingTitles] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialListing) return;

    setForm({
      title: initialListing.title ?? "",
      author: initialListing.author ?? "",
      category: initialListing.category ?? "",
      condition: initialListing.condition ?? "",
      isbn: initialListing.isbn ?? "",
      description: initialListing.description ?? "",
      photos: [],
    });
  }, [initialListing]);

  const canSubmit = useMemo(() => {
    const requiredTextOk =
      form.title.trim() &&
      form.author.trim() &&
      form.category.trim() &&
      form.condition.trim();

    const photosOk = mode === "edit" ? true : form.photos.length >= 1;
    return Boolean(requiredTextOk && photosOk);
  }, [form, mode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setShowTitleResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const query = form.isbn.trim();

    if (!query || looksLikeISBN(query)) {
      setTitleResults([]);
      setShowTitleResults(false);
      setIsSearchingTitles(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingTitles(true);

        const res = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(
            query
          )}&fields=key,title,author_name,cover_i,subject,editions,editions.isbn&limit=5`
        );

        if (!res.ok) {
          setTitleResults([]);
          setShowTitleResults(false);
          return;
        }

        const data = await res.json();
        const docs = Array.isArray(data.docs) ? data.docs : [];

        setTitleResults(docs);
        setShowTitleResults(true);
      } catch {
        setTitleResults([]);
        setShowTitleResults(false);
      } finally {
        setIsSearchingTitles(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [form.isbn]);

  async function autofillFromISBN(rawValue?: string) {
    const rawIsbn = (rawValue ?? form.isbn).trim();

    if (!rawIsbn) {
      setIsbnMessage({ text: "Please enter an ISBN to search.", type: "error" });
      return;
    }

    const cleanIsbn = rawIsbn.replace(/-/g, "");

    setIsSearchingISBN(true);
    setIsbnMessage(null);

    try {
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&jscmd=data&format=json`
      );

      if (!res.ok) {
        setIsbnMessage({
          text: "No matching book found. Please enter details manually.",
          type: "error",
        });
        return;
      }

      const data = await res.json();
      const book = data[`ISBN:${cleanIsbn}`];

      if (!book) {
        setIsbnMessage({
          text: "No matching book found. Please enter details manually.",
          type: "error",
        });
        return;
      }

      const authors =
        Array.isArray(book.authors) && book.authors.length > 0
          ? book.authors
              .map((a: { name?: string }) => a.name?.trim())
              .filter(Boolean)
              .join(", ")
          : "";

      const subjectNames: string[] =
        Array.isArray(book.subjects) && book.subjects.length > 0
          ? book.subjects
              .map((s: { name?: string }) => s.name?.trim() ?? "")
              .filter(Boolean)
          : [];

      const preferredGenre = cleanGenre(subjectNames);

      setForm((prev) => ({
        ...prev,
        title: book.title || prev.title,
        author: authors || prev.author,
        category: preferredGenre || prev.category,
        isbn: cleanIsbn || prev.isbn,
      }));

      setIsbnMessage({
        text: "Book details auto-filled successfully!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setIsbnMessage({ text: "Error fetching book data.", type: "error" });
    } finally {
      setIsSearchingISBN(false);
    }
  }

  async function handleSearchResultClick(book: SearchResult) {
    setShowTitleResults(false);

    const authors =
      Array.isArray(book.author_name) && book.author_name.length > 0
        ? book.author_name.join(", ")
        : "";

    const preferredGenre = cleanGenre(Array.isArray(book.subject) ? book.subject : []);

    const clickedISBN =
      book.editions?.docs?.flatMap((edition) => edition.isbn ?? []).find(Boolean) ?? "";

    if (clickedISBN) {
      setForm((prev) => ({
        ...prev,
        isbn: clickedISBN,
      }));
      await autofillFromISBN(clickedISBN);
      return;
    }

    setForm((prev) => ({
      ...prev,
      title: book.title || prev.title,
      author: authors || prev.author,
      category: preferredGenre || prev.category,
    }));

    setIsbnMessage({
      text: "Title, author, and category were filled. ISBN was not available, so please enter it manually.",
      type: "success",
    });
  }

  function onFilesSelected(files: FileList | null) {
    if (!files) return;

    const validFiles: File[] = [];
    let hasOversized = false;
    const MAX_SIZE = 5 * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (file.size > MAX_SIZE) {
        hasOversized = true;
      } else {
        validFiles.push(file);
      }
    });

    if (hasOversized) {
      setError("One or more files exceeded the 5MB limit and were skipped.");
    } else {
      setError(null);
    }

    setForm((prev) => {
      const merged = [...prev.photos, ...validFiles];
      const unique = merged.filter(
        (file, index, self) =>
          self.findIndex(
            (f) =>
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === file.lastModified
          ) === index
      );

      return {
        ...prev,
        photos: unique,
      };
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please fill all required fields and add at least 1 photo.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("author", form.author);
      fd.append("category", form.category);
      fd.append("condition", form.condition);
      fd.append("isbn", form.isbn);
      fd.append("description", form.description);

      for (const file of form.photos) fd.append("photos", file);

      const url =
        mode === "edit" && listingId
          ? `/api/book_listing/${listingId}`
          : "/api/book_listing";

      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to save listing.");
      }

      if (mode === "edit") {
        alert("Book listing updated successfully!");
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Book listed successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-6">
      <div className="p-5 bg-white/30 rounded-2xl border border-white/50 mb-4">
        <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider block mb-2">
          Search by ISBN or book title (optional)
        </label>

        <div ref={searchBoxRef} className="relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm"
              placeholder="Enter ISBN or Book Title"
              value={form.isbn}
              onChange={(e) => {
                setForm((p) => ({ ...p, isbn: e.target.value }));
                setIsbnMessage(null);
              }}
              onFocus={() => {
                if (titleResults.length > 0 && !looksLikeISBN(form.isbn.trim())) {
                  setShowTitleResults(true);
                }
              }}
            />

            <button
              type="button"
              onClick={() => autofillFromISBN()}
              disabled={isSearchingISBN}
              className="px-6 py-3 bg-[#a3b18a] hover:bg-[#8f9d77] text-white font-bold rounded-2xl transition-all shadow-md disabled:opacity-50 whitespace-nowrap"
            >
              {isSearchingISBN ? "Searching..." : "Auto-fill"}
            </button>
          </div>

          <AnimatePresence>
            {showTitleResults && !looksLikeISBN(form.isbn.trim()) && form.isbn.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[#e5dccf] bg-white/95 shadow-xl backdrop-blur-md"
              >
                {isSearchingTitles ? (
                  <div className="px-4 py-3 text-sm text-[#8a8a8a] font-medium">
                    Searching titles...
                  </div>
                ) : titleResults.length > 0 ? (
                  <>
                    {titleResults.map((book, index) => (
                      <button
                        key={`${book.key ?? book.title ?? "book"}-${index}`}
                        type="button"
                        onClick={() => handleSearchResultClick(book)}
                        className="flex w-full items-center gap-3 border-b border-[#efe7dc] px-4 py-3 text-left transition-colors hover:bg-[#f8f4ed]"
                      >
                        <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-[#e9e1d4]">
                          {book.cover_i ? (
                            <img
                              src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                              alt={book.title ?? "Book cover"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-[#8a8a8a]">
                              📖
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-semibold text-[#4a4a4a]">
                            {book.title ?? "Untitled"}
                          </div>
                          <div className="truncate text-sm text-[#7d7d7d] font-medium">
                            by {book.author_name?.join(", ") || "Unknown Author"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-3 text-sm text-[#8a8a8a] font-medium">
                    No matching books found.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isbnMessage && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`text-sm mt-2 ${
                isbnMessage.type === "error" ? "text-[#8b4513]" : "text-[#5a7d5a]"
              }`}
            >
              {isbnMessage.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Book Title" required>
          <input
            className="w-full bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </Field>

        <Field label="Author(s)" required>
          <input
            className="w-full bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm"
            value={form.author}
            onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
          />
        </Field>

        <Field label="Category/Genre" required>
          <input
            className="w-full bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          />
        </Field>

        <Field label="Condition" required>
          <select
            className="w-full bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm appearance-none"
            value={form.condition}
            onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
          >
            <option value="">Select condition…</option>
            <option value="new">New</option>
            <option value="somewhat_new">Somewhat New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </Field>
      </div>

      <Field label="Description (optional)">
        <textarea
          className="w-full bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm resize-none"
          rows={4}
          placeholder="Add any specific details, highlighting, or damages here..."
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </Field>

      <Field label="Book Photos" required hint="(Max 5MB per image)">
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFilesSelected(e.target.files)}
            className="block w-full text-sm text-[#8a8a8a]
              file:mr-4 file:py-2.5 file:px-6
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-[#a3b18a]/20 file:text-[#4a4a4a]
              hover:file:bg-[#a3b18a]/30 transition-all cursor-pointer"
          />
          {mode === "edit" && initialListing?.photos?.length ? (
            <p className="mt-2 text-xs text-[#8a8a8a]">
              Existing photos: {initialListing.photos.length}
            </p>
          ) : null}
          {form.photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.photos.map((f, i) => (
                <span
                  key={i}
                  className="bg-white/60 text-[#5c5c5c] text-xs px-3 py-1.5 rounded-full border border-white"
                >
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Field>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-sm text-[#8b4513] bg-red-100/50 border border-red-200 p-3 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full md:w-auto px-10 py-3 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20 disabled:opacity-50"
        >
          {submitting
            ? mode === "edit"
              ? "Updating Listing..."
              : "Saving Listing..."
            : mode === "edit"
              ? "Update Listing"
              : "Save Listing"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1 block">
      <div className="flex items-baseline gap-2">
        <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider">
          {label}
        </label>
        {required ? <span className="text-[#bc8a5f] text-xs font-bold">*</span> : null}
        {hint ? <span className="text-[#a0a0a0] text-xs italic ml-1">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}