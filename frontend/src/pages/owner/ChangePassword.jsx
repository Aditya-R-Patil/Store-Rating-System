
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Award,
  Bell,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Users,
  X,
  AlertCircle,
  ArrowRight,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import api from '../../services/api.js'

const NAV_ITEMS = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/store', label: 'My Store', icon: Store },
  { to: '/owner/ratings', label: 'Users Who Rated', icon: Users },
  { to: '/owner/change-password', label: 'Change Password', icon: KeyRound },
]

const C = {
  purple: '#241044',
  violet: '#7655D9',
  blue: '#38BDF8',
  light: '#F5F3FF',
  dark: '#25213A',
  gold: '#FBBF24',
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function getInitials(name) {
  return (name || 'S')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getStrength(password) {
  if (!password) {
    return { score: 0, label: 'Empty', color: '#94A3B8' }
  }

  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' }
  if (score === 2) return { score, label: 'Fair', color: '#F59E0B' }
  if (score === 3) return { score, label: 'Good', color: '#EAB308' }
  if (score === 4) return { score, label: 'Strong', color: '#22C55E' }

  return { score, label: 'Very Strong', color: '#16A34A' }
}

function Sidebar({ user, onNavigate, onLogout }) {
  const navClass = ({ isActive }) =>
    `relative flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'bg-white/10 text-[#38BDF8] shadow-lg shadow-black/10'
        : 'text-[#F5F3FF]/65 hover:bg-white/5 hover:text-white'
    }`

  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
          style={{
            background: 'linear-gradient(135deg,#7655D9,#38BDF8)',
          }}
        >
          <Store className="h-6 w-6 text-white" />
        </div>

        <div>
          <h2 className="font-bold text-white">Store Rating</h2>
          <p className="text-xs text-white/45">Management System</p>
        </div>
      </div>

      <div className="mx-4 my-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{
            background: 'linear-gradient(135deg,#7655D9,#38BDF8)',
          }}
        >
          {getInitials(user?.name)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {user?.name || 'Store Owner'}
          </p>
          <p className="truncate text-xs text-white/45">
            {user?.email || 'Store Owner'}
          </p>
        </div>
      </div>

      <p className="mb-3 px-7 text-[10px] font-bold uppercase tracking-[2px] text-white/35">
        Workspace
      </p>

      <nav className="flex-1 space-y-2 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={navClass}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="pointer-events-none absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#38BDF8]" />
                )}

                <Icon className="h-5 w-5 shrink-0" />
                {label}

                <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/65 transition-all hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#25213A]">
        {label}
      </label>

      <div
        className={`group relative rounded-xl border bg-white transition-all ${
          error
            ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-100'
            : 'border-[#7655D9]/15 focus-within:border-[#7655D9] focus-within:ring-4 focus-within:ring-[#7655D9]/10'
        }`}
      >
        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7655D9]" />

        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-xl bg-transparent py-4 pl-12 pr-12 text-sm text-[#25213A] outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#7655D9]"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-center gap-2 text-xs font-medium text-red-500"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Requirement({ met, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{
          background: met ? 'rgba(56,189,248,0.15)' : '#F1F5F9',
          color: met ? '#0284C7' : '#94A3B8',
        }}
      >
        <Check size={12} strokeWidth={3} />
      </span>

      <span
        className={`text-xs ${
          met ? 'font-semibold text-[#25213A]' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function SecurityInfo() {
  const tips = [
    {
      icon: Lock,
      title: 'Use a strong password',
      description: 'Combine uppercase letters, numbers and special symbols.',
    },
    {
      icon: Shield,
      title: 'Keep it private',
      description: 'Never share your password with anyone.',
    },
    {
      icon: Fingerprint,
      title: 'Use a unique password',
      description: 'Avoid reusing passwords from other accounts.',
    },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white bg-white p-6 shadow-lg shadow-[#7655D9]/10 sm:p-8"
    >
      <div
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(135deg,#7655D9,#38BDF8)',
        }}
      >
        <Fingerprint className="h-7 w-7 text-white" />
      </div>

      <h2 className="text-xl font-bold text-[#25213A]">
        Your Security Matters
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#25213A]/55">
        Follow these security practices to keep your store owner account
        protected.
      </p>

      <div className="mt-7 space-y-6">
        {tips.map(({ icon: Icon, title, description }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5F3FF] text-[#7655D9]">
              <Icon className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#25213A]">
                {title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#25213A]/55">
                {description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-5">
        <div className="flex items-center gap-2 text-sky-700">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-bold">Security Tip</span>
        </div>

        <p className="mt-2 text-xs leading-6 text-sky-800/75">
          Your new password must be 8–16 characters and contain at least
          one uppercase letter and one special character.
        </p>
      </div>
    </motion.section>
  )
}

export default function ChangePassword() {
  const navigate = useNavigate()

  const [user] = useState(readStoredUser)

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const strength = getStrength(form.newPassword)

  const updateField = (key) => (event) => {
    const value = event.target.value

    setForm((previous) => ({
      ...previous,
      [key]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [key]: '',
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!form.currentPassword) {
      newErrors.currentPassword = 'Current password is required.'
    }

    if (!form.newPassword) {
      newErrors.newPassword = 'New password is required.'
    } else if (
      form.newPassword.length < 8 ||
      form.newPassword.length > 16
    ) {
      newErrors.newPassword = 'Password must be 8–16 characters.'
    } else if (!/[A-Z]/.test(form.newPassword)) {
      newErrors.newPassword = 'Must contain at least one uppercase letter.'
    } else if (!/[^A-Za-z0-9]/.test(form.newPassword)) {
      newErrors.newPassword = 'Must contain at least one special character.'
    } else if (form.newPassword === form.currentPassword) {
      newErrors.newPassword =
        'New password must be different from current password.'
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.'
    } else if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })

      toast.success('Password updated successfully!')

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setErrors({})

      setShow({
        current: false,
        new: false,
        confirm: false,
      })
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Unable to update password.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully.')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] lg:flex">

      {/* Desktop Sidebar */}
      <aside
        className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col lg:flex"
        style={{
          background: 'linear-gradient(180deg,#241044 0%,#1A0C33 100%)',
        }}
      >
        <Sidebar user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-[#25213A]/60 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col"
              style={{
                background: 'linear-gradient(180deg,#241044 0%,#1A0C33 100%)',
              }}
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-white/70 hover:bg-white/10"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>

              <Sidebar
                user={user}
                onNavigate={() => setDrawerOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#7655D9]/10 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-xl p-2 text-[#25213A] hover:bg-[#7655D9]/10 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-[#25213A]">
                Welcome back, {user?.name?.split(' ')[0] || 'Owner'}!
              </p>
              <p className="truncate text-xs text-[#25213A]/50">
                Manage your account security
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => toast.info('You have no new notifications.')}
              aria-label="Notifications"
              className="relative rounded-xl p-2.5 text-[#25213A] transition hover:bg-[#7655D9]/10 hover:text-[#7655D9]"
            >
              <Bell className="h-5 w-5" />
            </button>

            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-[#25213A]">
                {user?.name || 'Store Owner'}
              </p>
              <p className="text-xs text-[#7655D9]">Store Owner</p>
            </div>

            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg,#7655D9,#38BDF8)',
              }}
            >
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-8 p-4 sm:p-7 lg:p-8">

          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[30px] p-7 text-white shadow-2xl shadow-[#7655D9]/20 sm:p-10 lg:p-12"
            style={{
              background:
                'linear-gradient(115deg,#241044 0%,#432477 55%,#315B91 100%)',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#38BDF8] blur-3xl"
            />

            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity }}
              className="pointer-events-none absolute bottom-[-50px] right-[25%] h-40 w-40 rounded-full border border-white/10 bg-white/5"
            />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-md">
                  <Sparkles className="h-4 w-4 text-[#38BDF8]" />
                  ACCOUNT SECURITY
                </span>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Keep Your Account Secure
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                  Protect your store owner account by keeping your password
                  strong, private and updated.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/85">
                  <ShieldCheck className="h-4 w-4 text-[#38BDF8]" />
                  Your security is our priority.
                </div>
              </div>

              <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl md:flex">
                <div className="flex h-24 w-24 items-center justify-center rounded-[25px] bg-white/10">
                  <ShieldCheck className="h-14 w-14 text-[#38BDF8]" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Page Heading */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#7655D9]">
                Account Settings
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#25213A]">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-[#25213A]/50">
                Update your password to protect your account.
              </p>
            </div>

            <span className="rounded-full border border-[#7655D9]/15 bg-white px-4 py-2 text-xs font-semibold text-[#7655D9] shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
              Secure Account
            </span>
          </div>

          {/* Content */}
          <div className="grid items-start gap-6 xl:grid-cols-5">

            {/* Security Information */}
            <div className="xl:col-span-2">
              <SecurityInfo />
            </div>

            {/* Password Form */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white bg-white p-6 shadow-lg shadow-[#7655D9]/10 sm:p-8 xl:col-span-3"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F3FF] text-[#7655D9]">
                  <KeyRound className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#25213A]">
                    Update Your Password
                  </h2>
                  <p className="mt-1 text-xs text-[#25213A]/50">
                    Enter your current and new password below.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                noValidate
              >
                <PasswordField
                  label="Current Password"
                  value={form.currentPassword}
                  onChange={updateField('currentPassword')}
                  show={show.current}
                  onToggle={() =>
                    setShow((previous) => ({
                      ...previous,
                      current: !previous.current,
                    }))
                  }
                  error={errors.currentPassword}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />

                <PasswordField
                  label="New Password"
                  value={form.newPassword}
                  onChange={updateField('newPassword')}
                  show={show.new}
                  onToggle={() =>
                    setShow((previous) => ({
                      ...previous,
                      new: !previous.new,
                    }))
                  }
                  error={errors.newPassword}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />

                {/* Password Strength */}
                <AnimatePresence>
                  {form.newPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl border border-[#7655D9]/10 bg-[#F5F3FF] p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#25213A]">
                            Password Strength
                          </span>

                          <span
                            className="text-xs font-bold"
                            style={{ color: strength.color }}
                          >
                            {strength.label}
                          </span>
                        </div>

                        <div className="mb-5 flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((number) => (
                            <div
                              key={number}
                              className="h-2 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background:
                                  number <= strength.score
                                    ? strength.color
                                    : '#E2E8F0',
                              }}
                            />
                          ))}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Requirement
                            met={
                              form.newPassword.length >= 8 &&
                              form.newPassword.length <= 16
                            }
                            label="8–16 characters"
                          />

                          <Requirement
                            met={/[A-Z]/.test(form.newPassword)}
                            label="One uppercase letter"
                          />

                          <Requirement
                            met={/[^A-Za-z0-9]/.test(form.newPassword)}
                            label="One special character"
                          />

                          <Requirement
                            met={
                              form.newPassword !== form.currentPassword
                            }
                            label="Different from current password"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <PasswordField
                  label="Confirm New Password"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  show={show.confirm}
                  onToggle={() =>
                    setShow((previous) => ({
                      ...previous,
                      confirm: !previous.confirm,
                    }))
                  }
                  error={errors.confirmPassword}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />

                {form.confirmPassword && (
                  <p
                    className={`flex items-center gap-2 text-xs font-semibold ${
                      form.confirmPassword === form.newPassword
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {form.confirmPassword === form.newPassword ? (
                      <Check size={15} />
                    ) : (
                      <AlertCircle size={15} />
                    )}

                    {form.confirmPassword === form.newPassword
                      ? 'Passwords match'
                      : 'Passwords do not match'}
                  </p>
                )}

                <div className="flex flex-col justify-end gap-3 border-t border-[#7655D9]/10 pt-6 sm:flex-row">
                  <NavLink
                    to="/owner/dashboard"
                    className="rounded-xl border border-[#7655D9]/20 px-6 py-3.5 text-center text-sm font-bold text-[#7655D9] transition hover:bg-[#F5F3FF]"
                  >
                    Cancel
                  </NavLink>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg,#7655D9,#38BDF8)',
                      boxShadow: '0 10px 25px -10px #7655D9',
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        Update Password
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.section>
          </div>

          {/* Footer */}
          <footer className="border-t border-[#7655D9]/10 pt-6 text-center">
            <p className="flex items-center justify-center gap-2 text-xs text-[#25213A]/45">
              <ShieldCheck className="h-4 w-4" />
              Store Rating Management System · Secure Account
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
