import { redirect } from 'next/navigation'
import { SignOutButton } from '../components/SignOutButton'
import { auth } from '@/auth'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function Dashboard() {
    const session = await auth.api.getSession({
    headers: await headers(),
    })

    if (!session) {
        redirect('/sign-in')
    }

    return (
        <main>
            <nav>
                <div>
                    <Link href="/profile">
                    Profile
                    </Link>
                </div>
                <div>
                    <SignOutButton />
                </div>
            </nav>
        <section className="p-10">
            <h1 className="text-2xl font-bold">Welcome, {session.user.name}!</h1>
        </section>
    </main>
  )
}