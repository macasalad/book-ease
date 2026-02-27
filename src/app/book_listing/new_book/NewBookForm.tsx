"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

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

  function onFilesSelected(files: FileList | null) {
    if (!files) return;
    setForm((prev) => ({ ...prev, photos: Array.from(files) }));
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
      // Use FormData so you can send images.
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("author", form.author);
      fd.append("category", form.category);
      fd.append("condition", form.condition);
      fd.append("isbn", form.isbn);
      fd.append("description", form.description); // optional

      for (const file of form.photos) fd.append("photos", file);

      // Later: implement POST in src/app/api/book_listing/route.ts
      const res = await fetch("/api/book_listing", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to save listing.");
      }

      // Reset after success
      setForm(initialState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required>
          <input
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </Field>

        <Field label="Author" required>
          <input
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2"
            value={form.author}
            onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
          />
        </Field>

        <Field label="Category" required>
          <input
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2"
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
          />
        </Field>

        <Field label="Condition" required>
          <select
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2"
            value={form.condition}
            onChange={(e) =>
              setForm((p) => ({ ...p, condition: e.target.value }))
            }
          >
            <option value="">Select…</option>
            <option value="new">New</option>
            <option value="like_new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </Field>

        <Field label="ISBN" required>
          <input
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2"
            value={form.isbn}
            onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))}
          />
        </Field>
      </div>

      <Field label="Description (optional)">
        <textarea
          className="w-full rounded border border-white/10 bg-white/5 px-3 py-2"
          rows={4}
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />
      </Field>

      <Field label="Photos" required hint="At least 1 image.">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFilesSelected(e.target.files)}
        />
        {form.photos.length > 0 && (
          <p className="text-sm text-slate-400">
            Selected: {form.photos.map((f) => f.name).join(", ")}
          </p>
        )}
      </Field>

      {error && (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save listing"}
      </button>
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
    <label className="block space-y-1">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{label}</span>
        {required ? <span className="text-xs text-slate-400">(required)</span> : null}
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}
