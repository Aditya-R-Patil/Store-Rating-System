
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Lock,
  Mail,
  KeyRound,
} from 'lucide-react'

import AuthInput from './AuthInput.jsx'
import { loginUser, saveSession } from '../../services/authService.js'
import { ROLE_DASHBOARD_PATHS } from '../../constants/roles.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REMEMBERED_EMAIL_KEY = 'rememberedEmail'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

function validateLoginForm({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

function getLoginErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.request && !error.response) {
    return 'Cannot reach the server. Please make sure the backend is running.'
  }

  return error.message || 'Something went wrong. Please try again.'
}

export default function LoginForm() {
  const navigate = useNavigate()

  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) || ''

  const [email, setEmail] = useState(rememberedEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail))
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateLoginForm({ email, password })

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const data = await loginUser(email.trim(), password)

      const dashboardPath = ROLE_DASHBOARD_PATHS[data.user.role]

      if (!dashboardPath) {
        throw new Error('Your account role is not recognized.')
      }

      saveSession(data)

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim())
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      // Debugging logs
      console.log('Login User:', data.user)
      console.log('Dashboard Path:', dashboardPath)
      console.log('Saved Token:', localStorage.getItem('token'))

      toast.success('Welcome back!')

      navigate(dashboardPath, { replace: true })
    } catch (error) {
      toast.error(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (field, setter) => (event) => {
    setter(event.target.value)

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleForgotPassword = () => {
    toast.info('Password reset functionality will be set up next.')
  }

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
          },
        },
      }}
    >
      <motion.div variants={itemVariants}>
        <AuthInput
          id="email"
          name="email"
          label="Email Address"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleFieldChange('email', setEmail)}
          error={errors.email}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <AuthInput
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={handleFieldChange('password', setPassword)}
          error={errors.password}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between gap-3"
      >
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 cursor-pointer rounded accent-violet-700"
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
          style={{ color: '#7655D9' }}
        >
          <KeyRound className="h-4 w-4" />
          Forgot Password?
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{
            scale: isSubmitting ? 1 : 1.015,
            boxShadow: '0 12px 28px rgba(118,85,217,0.35)',
          }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background: 'linear-gradient(110deg, #241044, #7655D9, #38BDF8)',
            color: '#FFFFFF',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              Sign In
            </>
          )}
        </motion.button>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="pt-2 text-center text-sm text-gray-500"
      >
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="font-bold transition-colors hover:underline"
          style={{ color: '#7655D9' }}
        >
          Create Account
        </Link>
      </motion.p>
    </motion.form>
  )
}
