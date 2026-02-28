'use client'

import { authClient } from '@/lib/auth-client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SignIn = () => {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  
  // Form State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () =>
    authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // --- REQUIREMENT: Validate required fields ---
    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    setIsLoading(true)

    try {
      // --- REQUIREMENT: Validate credentials via Better Auth ---
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/'
      })

      if (authError) {
        // --- REQUIREMENT: Display error message and keep user on flow ---
        setError(authError.message || "Invalid email or password.")
        setIsLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      // --- REQUIREMENT: Handle system errors safely ---
      setError("A connection error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="relative w-full max-w-md">
        {/* Animated background elements (keeping your cool circles) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/10"
            initial={{
              width: `${50 + i * 20}px`,
              height: `${50 + i * 20}px`,
              x: -25 - i * 10,
              y: -25 - i * 10,
              opacity: 0.2,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}

        <motion.div
          className="relative z-10 flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-400 mt-2">Sign in to BookEase</p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#111827] px-2 text-gray-500">Or continue with</span></div>
          </div>

          {/* Google Button (Your original button) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-white px-8 py-3 text-lg font-medium text-gray-900 shadow-lg transition-all"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600"
                initial={{ x: '-100%' }}
                animate={{ x: isHovering ? '0%' : '-100%' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 text-gray-900 transition-colors duration-300 group-hover:text-white">
                Google
              </span>
              <svg className="relative z-10 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
          </motion.div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}

export default SignIn