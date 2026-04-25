'use client'

import { authClient } from '@/lib/auth-client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const SignIn = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const { error: authError } = await authClient.signIn.social({ 
        provider: 'google', 
        callbackURL: '/dashboard' 
      })

      if (authError) {
        setError(authError.message || "Failed to initialize Google login.")
      }
    } catch (err) {
      setError("A connection error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f2ece4] via-[#e2d9c8] to-[#d4e2d4] p-4">
      <div className="relative w-full max-w-md">
        {/* Animated background elements (Muted Moss/Sage) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#a3b18a]/20"
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
          className="relative z-10 mb-8 flex justify-center rounded-2xl border border-white/60 bg-white/40 px-8 py-5 backdrop-blur-xl shadow-lg shadow-stone-200/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="text-7xl font-extrabold tracking-tight text-[#4a4a4a] cursor-default">
            Book<span className="text-[#bc8a5f]">Ease</span>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 flex flex-col rounded-2xl border border-white/60 bg-white/40 p-8 backdrop-blur-xl shadow-2xl shadow-stone-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#4a4a4a]">Welcome Back</h1>
            <p className="text-[#8a8a8a] mt-1 font-medium">Sign in to your account</p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden text-sm text-[#8b4513] bg-red-100/50 border border-red-200 p-3 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-white/80 px-8 py-3 text-lg font-medium text-[#4a4a4a] shadow-md transition-all border border-[#a3b18a]/20 disabled:opacity-50"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#bc8a5f] to-[#a47148]"
                initial={{ x: '-100%' }}
                animate={{ x: isHovering ? '0%' : '-100%' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                {isLoading ? "Connecting..." : "Google"}
              </span>
              {!isLoading && (
                <svg className="relative z-10 h-5 w-5 transition-colors duration-300 group-hover:text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

export default SignIn