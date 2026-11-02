
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MapPin,
  UserPlus,
  Lock,
  User,
} from 'lucide-react'

import BrandShowcase from '../components/auth/BrandShowcase.jsx'
import AuthInput from '../components/auth/AuthInput.jsx'
import api from '../services/api.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SPECIAL_CHAR_PATTERN = /[^A-Za-z0-9]/
const UPPERCASE_PATTERN = /[A-Z]/

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const INITIAL_VALUES = {
  name: '',
  email: '',
  address: '',
  password: '',
  confirmPassword: '',
}

function validateSignupForm(values) {
  const errors = {}

  const name = values.name.trim()
  const email = values.email.trim()
  const address = values.address.trim()

  // Name: 20 to 60 characters
  if (name.length < 20 || name.length > 60) {
    errors.name = 'Name must be between 20 and 60 characters.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!address) {
    errors.address = 'Address is required.'
  } else if (address.length > 400) {
    errors.address = 'Address must be 400 characters or fewer.'
  }

  const { password } = values

  if (password.length < 8 || password.length > 16) {
    errors.password = 'Password must be between 8 and 16 characters.'
  } else if (!UPPERCASE_PATTERN.test(password)) {
    errors.password = 'Password must include an uppercase letter.'
  } else if (!SPECIAL_CHAR_PATTERN.test(password)) {
    errors.password = 'Password must include a special character.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

function getSignupErrorMessages(error) {
  const data = error.response?.data

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) =>
        typeof item === 'string' ? item : item.msg || item.message
      )
      .filter(Boolean)
  }

  if (data?.message) return [data.message]

  if (error.request && !error.response) {
    return [
      'Cannot reach the server. Please make sure the backend is running.',
    ]
  }

  return ['Something went wrong. Please try again.']
}

export default function Signup() {
  const navigate = useNavigate()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((prev) => ({
      ...prev,
      [name]: name === 'name' ? value.slice(0, 60) : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateSignupForm(values)

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)

    try {
      await api.post('/auth/signup', {
        name: values.name.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
        password: values.password,
      })

      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (error) {
      getSignupErrorMessages(error).forEach((message) => {
        toast.error(message)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col lg:flex-row"
      style={{ backgroundColor: '#F5F3FF' }}
    >
      <BrandShowcase />

      <section
        className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-10 sm:px-10 lg:px-14"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(118,85,217,0.13), transparent 35%), radial-gradient(circle at bottom left, rgba(56,189,248,0.12), transparent 35%), #F5F3FF',
        }}
      >
        <div
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(56,189,248,0.16)' }}
        />

        <div
          className="pointer-events-none absolute -bottom-20 left-0 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(118,85,217,0.14)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-3xl border p-7 shadow-2xl backdrop-blur-xl sm:p-10"
          style={{
            backgroundColor: 'rgba(255,255,255,0.96)',
            borderColor: 'rgba(118,85,217,0.18)',
            boxShadow: '0 25px 70px rgba(36,16,68,0.13)',
          }}
        >
          <div className="mb-8">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #241044, #7655D9)',
              }}
            >
              <UserPlus className="h-6 w-6 text-white" />
            </div>

            <h2
              className="text-3xl font-bold leading-tight"
              style={{ color: '#25213A' }}
            >
              Create Your Account
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Join the community and start rating the stores you love.
            </p>
          </div>

          <motion.form
            noValidate
            onSubmit={handleSubmit}
            className="space-y-5"
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
                id="name"
                name="name"
                label="Full Name"
                icon={User}
                autoComplete="name"
                placeholder="Enter your name"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Enter between 20 and 60 characters.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AuthInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                icon={Mail}
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <AuthInput
                id="address"
                name="address"
                label="Address"
                icon={MapPin}
                autoComplete="street-address"
                placeholder="Enter your full address"
                value={values.address}
                onChange={handleChange}
                error={errors.address}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid gap-5 sm:grid-cols-2"
            >
              <AuthInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                icon={Lock}
                autoComplete="new-password"
                placeholder="8-16 characters"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="rounded-md p-1 text-gray-500 transition-colors hover:text-violet-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />

              <AuthInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                icon={Lock}
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={values.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                    className="rounded-md p-1 text-gray-500 transition-colors hover:text-violet-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xs leading-relaxed text-gray-500"
            >
              Password must be 8-16 characters and include at least one
              uppercase letter and one special character.
            </motion.p>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{
                  scale: isSubmitting ? 1 : 1.015,
                  boxShadow: '0 12px 28px rgba(118,85,217,0.35)',
                }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background:
                    'linear-gradient(110deg, #241044, #7655D9, #38BDF8)',
                  color: '#FFFFFF',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </>
                )}
              </motion.button>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="pt-2 text-center text-sm text-gray-500"
            >
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold transition-colors hover:underline"
                style={{ color: '#7655D9' }}
              >
                Sign In
              </Link>
            </motion.p>
          </motion.form>
        </motion.div>
      </section>
    </main>
  )
}
