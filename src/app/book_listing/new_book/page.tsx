import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "../../../../auth";
import NewBookForm from "./NewBookForm";

export default async function NewBookPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] text-[#4a4a4a] overflow-hidden relative font-sans flex flex-col items-center justify-center p-6">
        {/* Background Decorative Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#a3b18a]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bc8a5f]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-3xl relative z-10 my-10">
            {/* Back Link */}
            <div className="mb-6 ml-2">
                <Link 
                    href="/dashboard" 
                    className="inline-flex items-center gap-2 text-[#8a8a8a] hover:text-[#bc8a5f] transition-colors font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Catalog
                </Link>
            </div>

            {/* Glass Container for the Form */}
            <div className="w-full p-8 md:p-12 rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-lg shadow-xl shadow-stone-200/50">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-[#4a4a4a]">List a Book</h1>
                    <p className="text-[#8a8a8a] mt-2 font-medium">Share your resources with the Ateneo community</p>
                </div>

                <NewBookForm />
            </div>
        </div>
    </main>
  );
}