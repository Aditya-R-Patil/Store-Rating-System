
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Star,
  Store,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  CircleCheck,
} from 'lucide-react'
import api from '../../services/api.js'

const COLORS = {
  midnight: '#241044',
  violet: '#7655D9',
  electric: '#38BDF8',
  lavender: '#F5F3FF',
  charcoal: '#25213A',
  white: '#FFFFFF',
  gold: '#FBBF24',
}

const INITIAL_VALUES = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const getPasswordChecks = (password) => [
  { label: '8–16 characters', met: password.length >= 8 && password.length <= 16 },
  { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
  { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
]

const validateForm = (values) => {
  const errors = {}

  if (!values.currentPassword) {
    errors.currentPassword = 'Current password is required.'
  }

  if (!values.newPassword) {
    errors.newPassword = 'New password is required.'
  } else if (!getPasswordChecks(values.newPassword).every((item) => item.met)) {
    errors.newPassword = 'Password must meet all the requirements.'
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = 'New password must be different from current password.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.'
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function getErrorMessages(error) {
  const data = error.response?.data

  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors
      .map((item) => typeof item === 'string' ? item : item.msg || item.message)
      .filter(Boolean)
  }

  if (data?.message) return [data.message]

  if (error.request && !error.response) {
    return ['Cannot reach the server. Please check your backend.']
  }

  return ['Could not change your password. Please try again.']
}

function SidebarContent({ userName, userEmail, onNavigate, onLogout }) {
  const initials = (userName || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const navClass = ({ isActive }) =>
    `relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'bg-white/10 text-[#38BDF8]'
        : 'text-[#F5F3FF]/75 hover:bg-white/5 hover:text-white'
    }`

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-6">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7655D9, #38BDF8)' }}
        >
          <Store className="h-5 w-5 text-white" />
        </div>

        <div>
          <p className="text-sm font-bold tracking-wide text-white">Store Rating</p>
          <p className="text-xs text-[#F5F3FF]/60">Management System</p>
        </div>
      </div>

      <div className="px-6 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#F5F3FF]/40">
          Main Menu
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        <NavLink to="/user/dashboard" onClick={onNavigate} className={navClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="user-nav-indicator"
                  className="pointer-events-none absolute left-0 top-2 h-[calc(100%-16px)] w-1 rounded-r-full bg-[#38BDF8]"
                />
              )}
              <LayoutDashboard size={19} />
              Dashboard
            </>
          )}
        </NavLink>

        <NavLink to="/user/ratings" onClick={onNavigate} className={navClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="user-nav-indicator"
                  className="pointer-events-none absolute left-0 top-2 h-[calc(100%-16px)] w-1 rounded-r-full bg-[#38BDF8]"
                />
              )}
              <Star size={19} />
              My Ratings
            </>
          )}
        </NavLink>

        <NavLink to="/user/change-password" onClick={onNavigate} className={navClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="user-nav-indicator"
                  className="pointer-events-none absolute left-0 top-2 h-[calc(100%-16px)] w-1 rounded-r-full bg-[#38BDF8]"
                />
              )}
              <KeyRound size={19} />
              Change Password
            </>
          )}
        </NavLink>
      </nav>

      <div className="space-y-3 border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7655D9, #38BDF8)' }}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{userName || 'User'}</p>
            <p className="truncate text-xs text-[#F5F3FF]/50">{userEmail || 'Signed in'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#F5F3FF]/70 transition-all hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </>
  )
}

function PasswordField({
  id,
  name,
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  visible,
  onToggle,
  autoComplete,
  disabled,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#25213A]">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="group relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7655D9]/60 transition-colors group-focus-within:text-[#7655D9]"
        />

        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm text-[#25213A] outline-none transition-all duration-300 placeholder:text-[#25213A]/35 focus:ring-4 disabled:opacity-60 ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-[#7655D9]/20 focus:border-[#7655D9] focus:ring-[#7655D9]/10'
          }`}
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#25213A]/45 transition hover:bg-[#7655D9]/10 hover:text-[#7655D9]"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs font-medium text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function PasswordChecklist({ password }) {
  const checks = getPasswordChecks(password)

  return (
    <div className="rounded-2xl border border-[#7655D9]/10 bg-[#F5F3FF]/70 p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#25213A]/65">
        <Shield size={14} />
        Password Requirements
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {checks.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              item.met ? 'text-[#7655D9]' : 'text-[#25213A]/50'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                item.met ? 'bg-[#7655D9] text-white' : 'bg-[#25213A]/10'
              }`}
            >
              {item.met && <Check size={12} />}
            </span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function SecurityInfo() {
  return (
    <div className="relative hidden min-h-[210px] flex-col justify-between overflow-hidden rounded-3xl p-6 text-white lg:flex"
      style={{ background: 'linear-gradient(135deg, #241044 0%, #432477 65%, #315B91 100%)' }}
    >
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#38BDF8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-[#7655D9]/50 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
          <ShieldCheck size={25} />
        </div>
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
          Account Security
        </span>
      </div>

      <div className="relative mt-8">
        <p className="text-lg font-bold">Your security matters.</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
          Keep your account safe by choosing a strong and unique password.
        </p>
      </div>
    </div>
  )
}

export default function ChangePassword() {
  const navigate = useNavigate()
  const [user] = useState(readStoredUser)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [visibility, setVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const userName = user?.name || 'User'
  const userEmail = user?.email || ''
  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const toggleVisibility = (field) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    if (name === 'newPassword' && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateForm(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)

    try {
      await api.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      toast.success('Password changed successfully!')
      setValues(INITIAL_VALUES)
      setErrors({})
      setVisibility({ current: false, new: false, confirm: false })
    } catch (error) {
      getErrorMessages(error).forEach((message) => toast.error(message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setValues(INITIAL_VALUES)
    setErrors({})
    setVisibility({ current: false, new: false, confirm: false })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] lg:flex">
      {/* Desktop Sidebar */}
    <aside
  className="sticky top-0 z-50 hidden h-screen w-72 shrink-0 flex-col text-white lg:flex"
  style={{
    background: 'linear-gradient(180deg, #241044 0%, #1A0C33 100%)',
    pointerEvents: 'auto',
  }}
>
  <SidebarContent
    userName={userName}
    userEmail={userEmail}
    onLogout={handleLogout}
  />
</aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-[#25213A]/60 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col text-white lg:hidden"
              style={{ background: 'linear-gradient(180deg, #241044 0%, #1A0C33 100%)' }}
            >
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-white/70 hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>

              <SidebarContent
                userName={userName}
                userEmail={userEmail}
                onNavigate={() => setIsDrawerOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/70 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-xl p-2 text-[#25213A] transition hover:bg-[#7655D9]/10 hover:text-[#7655D9] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <h2 className="text-base font-bold text-[#25213A] sm:text-lg">
                Change Password
              </h2>
              <p className="text-xs text-[#25213A]/55">
                Manage your account security
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#25213A]">{userName}</p>
              <p className="text-xs text-[#7655D9]">Normal User</p>
            </div>

            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7655D9, #38BDF8)' }}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-7">

            {/* Hero */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-[#7655D9]/20 sm:p-9"
              style={{
                background: 'linear-gradient(115deg, #241044 0%, #432477 55%, #315B91 100%)',
              }}
            >
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#38BDF8]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#7655D9]/40 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="max-w-xl">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                    <Sparkles size={14} />
                    Account Protection
                  </span>

                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                    Secure Your Account
                  </h1>

                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
                    Update your password regularly and keep your Store Rating account protected.
                  </p>
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg md:flex"
                >
                  <ShieldCheck size={58} strokeWidth={1.4} />
                </motion.div>
              </div>
            </motion.section>

            {/* Form and Security Info */}
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">

              {/* Password Form */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-[#7655D9]/10"
              >
                <div className="border-b border-[#7655D9]/10 px-5 py-6 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7655D9]/10 text-[#7655D9]">
                      <KeyRound size={22} />
                    </div>

                    <div>
                      <h2 className="font-bold text-[#25213A]">Update Password</h2>
                      <p className="mt-0.5 text-xs text-[#25213A]/50">
                        Enter your existing and new password details.
                      </p>
                    </div>
                  </div>
                </div>

                <form noValidate onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
                  <PasswordField
                    id="currentPassword"
                    name="currentPassword"
                    label="Current Password"
                    placeholder="Enter your current password"
                    icon={Lock}
                    value={values.currentPassword}
                    onChange={handleChange}
                    error={errors.currentPassword}
                    visible={visibility.current}
                    onToggle={() => toggleVisibility('current')}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />

                  <div className="space-y-4">
                    <PasswordField
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
                      placeholder="Create a strong new password"
                      icon={KeyRound}
                      value={values.newPassword}
                      onChange={handleChange}
                      error={errors.newPassword}
                      visible={visibility.new}
                      onToggle={() => toggleVisibility('new')}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />

                    <PasswordChecklist password={values.newPassword} />
                  </div>

                  <PasswordField
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm New Password"
                    placeholder="Enter your new password again"
                    icon={ShieldCheck}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    visible={visibility.confirm}
                    onToggle={() => toggleVisibility('confirm')}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />

                  <div className="flex flex-col-reverse gap-3 border-t border-[#7655D9]/10 pt-6 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={isSubmitting}
                      className="rounded-xl border border-[#7655D9]/25 px-6 py-3 text-sm font-semibold text-[#25213A] transition-all hover:bg-[#F5F3FF] disabled:opacity-50"
                    >
                      Clear Fields
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7655D9]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                      style={{ background: 'linear-gradient(135deg, #7655D9, #5C43B5)' }}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={17} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={17} />
                          Update Password
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.section>

              {/* Right Side Information */}
              <div className="space-y-5">
                <SecurityInfo />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-3xl border border-[#7655D9]/10 bg-white p-6 shadow-lg shadow-[#7655D9]/5"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <CircleCheck size={19} className="text-[#7655D9]" />
                    <h3 className="font-bold text-[#25213A]">Security Tips</h3>
                  </div>

                  <ul className="space-y-4">
                    {[
                      'Use a unique password for your account.',
                      'Avoid using personal information.',
                      'Never share your password with anyone.',
                      'Use a combination of letters and symbols.',
                    ].map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-[#25213A]/65">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7655D9]/10 text-[#7655D9]">
                          <Check size={12} />
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <div className="rounded-2xl border border-[#38BDF8]/20 bg-[#38BDF8]/5 p-5">
                  <div className="flex items-center gap-2 text-[#315B91]">
                    <ShieldCheck size={18} />
                    <p className="text-sm font-bold">Your account is important</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#25213A]/60">
                    Make sure your new password is difficult to guess and easy for you to remember.
                  </p>
                </div>
              </div>
            </div>

            <p className="pb-2 text-center text-xs text-[#25213A]/40">
              Store Rating System · Account Security
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
