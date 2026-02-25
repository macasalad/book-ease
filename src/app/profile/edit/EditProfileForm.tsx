"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileForm({ user }: any) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [customImage, setCustomImage] = useState(user.customImage || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio,
        customImage,
      }),
    });

    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-10 space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2"
        placeholder="Name"
      />

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full border p-2"
        placeholder="Your bio"
      />

      <input
        value={customImage}
        onChange={(e) => setCustomImage(e.target.value)}
        className="w-full border p-2"
        placeholder="Image URL"
      />

      <button
        type="submit"
        className="px-4 py-2 bg-black text-white rounded"
      >
        Save Changes
      </button>
    </form>
  );
}