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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        
        <h1 className="text-2xl font-bold flex-1">Add book listing</h1>
      </div>
      <div className="mt-8">
        <NewBookForm />
        <br></br>
      </div>

      <div className="flex items-center gap-4 mb-8"> 
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-all"
        >
          ← Back to Catalog
        </Link>
      </div>
      
    </div>
  );
}
