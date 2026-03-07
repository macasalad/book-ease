'use client'

import { authClient } from '@/lib/auth-client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const Register = () => {
  const router = useRouter()
  
  // Form State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // --- REQUIREMENT: Validate required fields and formats ---
    if (!name || !email || !password) {
      setError("Please fill in all fields.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsLoading(true)

    try {
      // --- REQUIREMENT: Check for duplicate credentials ---
      const { data, error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/'
      })

      if (authError) {
        // Handle "User already exists" or other registration errors
        setError(authError.message || "Registration failed. Try a different email.")
        setIsLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      // --- REQUIREMENT: Handle system errors safely ---
      setError("System error. Your data was not saved. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] p-4">
      <div className="relative w-full max-w-md">
        {/* Animated background elements - now in Moss/Sage tones */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#a3b18a]/30"
            initial={{
              width: `${50 + i * 20}px`,
              height: `${50 + i * 20}px`,
              x: -25 - i * 10,
              y: -25 - i * 10,
              opacity: 0.2,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
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
          className="relative z-10 flex flex-col rounded-2xl border border-white/60 bg-white/40 p-8 backdrop-blur-xl shadow-2xl shadow-stone-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#5c5c5c]">Join BookEase</h1>
            <p className="text-[#8a8a8a] mt-2 font-medium">Create your account to get started</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden text-sm text-[#8b4513] bg-red-100/50 border border-red-200 p-3 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/60 border border-[#a3b18a]/40 rounded-lg px-4 py-3 text-[#4a4a4a] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/60 border border-[#a3b18a]/40 rounded-lg px-4 py-3 text-[#4a4a4a] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/60 border border-[#a3b18a]/40 rounded-lg px-4 py-3 text-[#4a4a4a] placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#bc8a5f]/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#bc8a5f] hover:bg-[#a47148] text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-[#bc8a5f]/20 disabled:opacity-50 mt-2"
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#8a8a8a]">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#a47148] hover:text-[#8b4513] transition-colors font-bold">
              Log in here
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}

export default Register