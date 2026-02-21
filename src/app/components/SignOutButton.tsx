'use client'
 
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
 
export const SignOutButton = () => {
  const router = useRouter()
 
  const handleSignOut = async () => {
    await authClient.signOut()
    router.refresh()
  }
 
  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-red-300 transition hover:text-red-200"
    >
      Sign Out
    </button>
  )
}