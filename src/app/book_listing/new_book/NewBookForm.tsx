"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
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

const initialState: FormState = {
  title: "",
  author: "",
  category: "",
  condition: "",
  isbn: "",
  description: "",
  photos: [],
};

export default function NewBookForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSearchingISBN, setIsSearchingISBN] = useState(false);
  const [isbnMessage, setIsbnMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const canSubmit = useMemo(() => {
    const requiredTextOk =
      form.title.trim() &&
      form.author.trim() &&
      form.category.trim() &&
      form.condition.trim() &&
      form.isbn.trim();

    const photosOk = form.photos.length >= 1;
    return Boolean(requiredTextOk && photosOk);
  }, [form]);

  // Google Books API ISBN Search
  const handleISBNSearch = async () => {
    if (!form.isbn.trim()) {
      setIsbnMessage({ text: "Please enter an ISBN to search.", type: "error" });
      return;
    }

    setIsSearchingISBN(true);
    setIsbnMessage(null);

    try {
      const res = await fetch(`https://openlibrary.org/isbn/${form.isbn.trim()}.json`);
      if (!res.ok) {
        setIsbnMessage({
          text: "No matching book found. Please enter details manually.",
          type: "error",
        });
        return;
      }
  
      const data = await res.json();
      const authors = await Promise.all(
        (data.authors || []).map(async (a: any) => {
          const authorRes = await fetch(`https://openlibrary.org${a.key}.json`);
          const authorData = await authorRes.json();
          return authorData.name;
        })
      );
  
      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        author: authors.join(", ") || prev.author,
        category: data.subjects ? data.subjects[0] : prev.category,
        description: data.description ? (typeof data.description === "string" ? data.description : data.description.value) : prev.description,
      }));
  
      setIsbnMessage({ text: "Book details auto-filled successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setIsbnMessage({ text: "Error fetching book data.", type: "error" });
    } finally {
      setIsSearchingISBN(false);
    }
  };

  // Image size validation (5MB Limit)
  function onFilesSelected(files: FileList | null) {
    if (!files) return;
    
    const validFiles: File[] = [];
    let hasOversized = false;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach(file => {
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

    setForm((prev) => ({ ...prev, photos: validFiles }));
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

      const res = await fetch("/api/book_listing", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to save listing.");
      }

      setForm(initialState);
      alert("Book listed successfully!"); // Temporary feedback, can redirect later
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-6">
      
      {/* ISBN Search Group */}
      <div className="p-5 bg-white/30 rounded-2xl border border-white/50 mb-4">
        <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider block mb-2">
            Search by ISBN
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm"
            placeholder="e.g. 9780131103627"
            value={form.isbn}
            onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))}
          />
          <button
            type="button"
            onClick={handleISBNSearch}
            disabled={isSearchingISBN}
            className="px-6 py-3 bg-[#a3b18a] hover:bg-[#8f9d77] text-white font-bold rounded-2xl transition-all shadow-md disabled:opacity-50 whitespace-nowrap"
          >
            {isSearchingISBN ? "Searching..." : "Auto-fill"}
          </button>
        </div>
        <AnimatePresence>
            {isbnMessage && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-sm mt-2 ${isbnMessage.type === 'error' ? 'text-[#8b4513]' : 'text-[#5a7d5a]'}`}
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
            {form.photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
                {form.photos.map((f, i) => (
                    <span key={i} className="bg-white/60 text-[#5c5c5c] text-xs px-3 py-1.5 rounded-full border border-white">
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
            animate={{ opacity: 1, height: 'auto' }}
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
            {submitting ? "Saving Listing..." : "Save Listing"}
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