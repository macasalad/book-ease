"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileForm({ user }: any) {
    const router = useRouter();

    const [name, setName] = useState(user.name || "");
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
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            {/* Name Input Group */}
            <div className="space-y-1">
                <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider">
                    Display Name
                </label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm"
                />
            </div>

            {/* Bio Input Group */}
            <div className="space-y-1">
                <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider">
                    Bio
                </label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your reading journey..."
                    rows={4}
                    className="w-full bg-white/50 border border-[#a3b18a]/30 rounded-2xl px-4 py-3 text-[#5c5c5c] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all shadow-sm resize-none"
                />
            </div>

            {/* File Upload Group */}
            <div className="space-y-1">
                <label className="text-[#8a8a8a] text-sm font-semibold uppercase tracking-wider">
                    Profile Picture
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-[#8a8a8a]
                        file:mr-4 file:py-2.5 file:px-6
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#a3b18a]/20 file:text-[#4a4a4a]
                        hover:file:bg-[#a3b18a]/30 transition-all cursor-pointer"
                />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-3 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}