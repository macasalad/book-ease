"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileForm({ user }: any) {
    const router = useRouter();

    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let imageUrl = user.customImage;

    // Upload file if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      imageUrl = data.url; // URL returned from API
    }

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio,
        customImage: imageUrl,
      }),
    });

    setLoading(false);
    router.push("/profile");
    router.refresh();
  }

 return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-10 space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full border p-2"
      />

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Your bio"
        className="w-full border p-2"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}