import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default async function Home() {
  const session = await authClient.getSession()
  const sessionData = session.data

  if (!sessionData) {
    redirect('/sign-in')
  } else {
    redirect('/dashboard')
  }
}