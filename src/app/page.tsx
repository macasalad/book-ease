import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default async function Home() {
  const session = await authClient.getSession()

  if (!session.data) {
    redirect('/sign-in')
  }

  redirect('/dashboard')
}