
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  ArrowLeft, Check, ChevronRight, Eye, EyeOff, LayoutDashboard,
  Lock, LogOut, Mail, MapPin, Menu, Plus, RefreshCw, Shield,
  Store, User, UserPlus, Users, X, Sparkles, KeyRound
} from 'lucide-react'
import api from '../../services/api.js'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Manage Users', to: '/admin/users', icon: Users },
  { label: 'Manage Stores', to: '/admin/stores', icon: Store },
  { label: 'Add User', to: '/admin/users/new', icon: UserPlus },
  { label: 'Add Store', to: '/admin/stores/new', icon: Plus },
]

const ROLE_OPTIONS = [
  { value: 'user', label: 'Normal User', description: 'Browse stores and submit ratings', icon: User },
  { value: 'owner', label: 'Store Owner', description: 'Manage store and view ratings', icon: Store },
  { value: 'admin', label: 'Administrator', description: 'Manage the complete platform', icon: Shield },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_VALUES = {
  name: '',
  email: '',
  address: '',
  password: '',
  confirmPassword: '',
  role: ''
}

const inputClass = (error) =>
  `w-full rounded-xl border bg-[#F9F7FF] px-4 py-3 pl-11 text-sm text-[#25213A] placeholder:text-[#25213A]/40 outline-none transition-all duration-300 focus:bg-white focus:ring-4 ${
    error
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-[#7655D9]/15 focus:border-[#7655D9] focus:ring-[#7655D9]/10'
  }`

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function getPasswordChecks(password) {
  return [
    { label: '8–16 characters', met: password.length >= 8 && password.length <= 16 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]
}

function validateUserForm(values) {
  const errors = {}

  const name = values.name.trim()

  if (!name) {
    errors.name = 'Full name is required.'
  } else if (name.length < 20 || name.length > 60) {
    errors.name = 'Name must be between 20 and 60 characters.'
  }

  const email = values.email.trim()

  if (!email) {
    errors.email = 'Email address is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  const address = values.address.trim()

  if (!address) {
    errors.address = 'Address is required.'
  } else if (address.length > 400) {
    errors.address = 'Address cannot exceed 400 characters.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (!getPasswordChecks(values.password).every(item => item.met)) {
    errors.password = 'Password must meet all security requirements.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm password.'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!values.role) {
    errors.role = 'Please select a user role.'
  }

  return errors
}

function SidebarContent({ onNavigate, onLogout }) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7655D9] to-[#38BDF8] shadow-lg shadow-[#7655D9]/30">
          <Store size={22} className="text-white" />
        </div>
        <div>
          <p className="text-base font-bold tracking-wide text-white">Store Rating</p>
          <p className="text-xs text-[#F5F3FF]/50">Management Portal</p>
        </div>
      </div>

      <div className="px-6 pb-3 text-[10px] font-bold uppercase tracking-[2px] text-[#F5F3FF]/35">
        Main Menu
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin/dashboard'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#7655D9]/30 to-[#38BDF8]/10 text-[#38BDF8] shadow-inner'
                  : 'text-[#F5F3FF]/65 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="admin-nav-indicator"
                    className="absolute left-0 top-2 h-[calc(100%-16px)] w-1 rounded-r-full bg-[#38BDF8]"
                  />
                )}
                <Icon size={19} />
                {label}
                {isActive && <ChevronRight size={15} className="ml-auto" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#F5F3FF]/65 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </>
  )
}

function FormField({ label, id, icon: Icon, error, hint, children }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#25213A]">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7655D9]/60"
          />
        )}
        {children}
      </div>

      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-xs font-medium text-red-500"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-[#25213A]/45">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function PasswordField({ label, id, value, onChange, error, visible, toggle, disabled }) {
  return (
    <FormField label={label} id={id} icon={Lock} error={error}>
      <input
        id={id}
        name={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        autoComplete="new-password"
        disabled={disabled}
        className={`${inputClass(error)} pr-12`}
      />

      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#25213A]/45 transition hover:bg-[#7655D9]/10 hover:text-[#7655D9]"
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </FormField>
  )
}

function PasswordChecklist({ password }) {
  return (
    <div className="mt-4 rounded-xl border border-[#7655D9]/10 bg-[#F9F7FF] p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#25213A]/55">
        Password requirements
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {getPasswordChecks(password).map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                item.met
                  ? 'bg-[#7655D9] text-white'
                  : 'bg-[#25213A]/10 text-[#25213A]/30'
              }`}
            >
              <Check size={12} />
            </span>

            <span
              className={`text-xs font-medium ${
                item.met ? 'text-[#7655D9]' : 'text-[#25213A]/50'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AddUser() {
  const navigate = useNavigate()

  const [user] = useState(readStoredUser)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const adminName = user?.name || 'Administrator'

  const initials = adminName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues(prev => ({
      ...prev,
      [name]: name === 'name' ? value.slice(0, 60) : value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateUserForm(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/admin/users', {
        name: values.name.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
        password: values.password,
        role: values.role,
      })

      toast.success('User created successfully!')
      navigate('/admin/users')
    } catch (error) {
      const data = error.response?.data

      if (Array.isArray(data?.errors)) {
        data.errors.forEach(item =>
          toast.error(item.msg || item.message || item)
        )
      } else {
        toast.error(data?.message || 'Unable to create user. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    toast.success('Logged out successfully.')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-[#241044] via-[#241044] to-[#170B2D] lg:flex">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#241044] lg:hidden"
            >
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-white"
              >
                <X size={20} />
              </button>

              <SidebarContent
                onNavigate={() => setIsDrawerOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#7655D9]/10 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-xl p-2 text-[#241044] hover:bg-[#7655D9]/10 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-base font-bold text-[#25213A]">Add User</p>
              <p className="text-xs text-[#25213A]/45">
                Dashboard / Users / Add User
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#25213A]">{adminName}</p>
              <p className="text-xs font-medium text-[#7655D9]">
                System Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7655D9] to-[#38BDF8] text-sm font-bold text-white shadow-lg shadow-[#7655D9]/20">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-7 p-4 sm:p-7 lg:p-9">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#241044] via-[#51309D] to-[#38BDF8] p-6 text-white shadow-xl shadow-[#7655D9]/20 sm:p-9"
          >
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-[#38BDF8]/20 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md">
                  <Sparkles size={14} />
                  USER MANAGEMENT
                </div>

                <p className="flex items-center gap-1.5 text-xs text-white/65">
                  Dashboard <ChevronRight size={13} /> Users <ChevronRight size={13} /> Add User
                </p>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Create New User
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
                  Add a new member to your platform and assign the right access permissions.
                </p>
              </div>

              <button
                onClick={() => navigate('/admin/users')}
                style={{ backgroundColor: '#FFFFFF', color: '#241044' }}
                className="flex items-center justify-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:self-auto"
              >
                <ArrowLeft size={17} />
                Back to Users
              </button>
            </div>
          </motion.section>

          <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
            <motion.form
              noValidate
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-[26px] border border-white bg-white shadow-xl shadow-[#7655D9]/10"
            >
              <div className="border-b border-[#7655D9]/10 bg-gradient-to-r from-white to-[#F9F7FF] px-6 py-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7655D9]/10 text-[#7655D9]">
                    <UserPlus size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#25213A]">
                      Account Information
                    </h2>
                    <p className="text-xs text-[#25213A]/50">
                      Enter the new user's details below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8 p-6 sm:p-8">
                <section>
                  <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-[#7655D9]">
                    <User size={17} /> Personal Details
                  </h3>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <FormField
                        label="Full Name"
                        id="name"
                        icon={User}
                        error={errors.name}
                        hint="Enter between 20 and 60 characters."
                      >
                        <input
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          minLength={20}
                          maxLength={60}
                          placeholder="Enter full name"
                          disabled={isSubmitting}
                          className={inputClass(errors.name)}
                        />
                      </FormField>
                    </div>

                    <FormField
                      label="Email Address"
                      id="email"
                      icon={Mail}
                      error={errors.email}
                    >
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        disabled={isSubmitting}
                        className={inputClass(errors.email)}
                      />
                    </FormField>

                    <FormField
                      label="User Role"
                      id="role"
                      icon={Shield}
                      error={errors.role}
                      hint="Select account permissions."
                    >
                      <select
                        id="role"
                        name="role"
                        value={values.role}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={inputClass(errors.role)}
                      >
                        <option value="">Select user role</option>
                        {ROLE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <div className="sm:col-span-2">
                      <FormField
                        label="Full Address"
                        id="address"
                        icon={MapPin}
                        error={errors.address}
                        hint="Maximum 400 characters."
                      >
                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          maxLength={400}
                          value={values.address}
                          onChange={handleChange}
                          placeholder="Enter complete address"
                          disabled={isSubmitting}
                          className={`${inputClass(errors.address)} resize-y`}
                        />
                      </FormField>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-[#7655D9]/20 to-transparent" />

                <section>
                  <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-[#7655D9]">
                    <KeyRound size={17} /> Account Security
                  </h3>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <PasswordField
                      label="Password"
                      id="password"
                      value={values.password}
                      onChange={handleChange}
                      error={errors.password}
                      visible={showPassword}
                      toggle={() => setShowPassword(prev => !prev)}
                      disabled={isSubmitting}
                    />

                    <PasswordField
                      label="Confirm Password"
                      id="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      visible={showConfirmPassword}
                      toggle={() => setShowConfirmPassword(prev => !prev)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <PasswordChecklist password={values.password} />
                </section>

                <div className="flex flex-col-reverse gap-3 border-t border-[#7655D9]/10 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    disabled={isSubmitting}
                    className="rounded-xl border border-[#7655D9]/25 px-6 py-3 text-sm font-semibold text-[#25213A] transition hover:bg-[#F5F3FF] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: '#7655D9', color: '#FFFFFF' }}
                    className="flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-bold shadow-lg shadow-[#7655D9]/25 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <UserPlus size={17} />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.form>

            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#241044] to-[#51309D] p-6 text-white shadow-xl shadow-[#7655D9]/20">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Shield size={24} className="text-[#38BDF8]" />
                </div>

                <h3 className="text-lg font-bold">Role Permissions</h3>

                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Each role has different access permissions across the platform.
                </p>

                <div className="mt-6 space-y-4">
                  {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                    <div
                      key={value}
                      className={`rounded-xl border p-3 transition ${
                        values.role === value
                          ? 'border-[#38BDF8]/60 bg-white/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="shrink-0 text-[#38BDF8]" />

                        <div>
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="mt-0.5 text-[11px] text-white/55">
                            {description}
                          </p>
                        </div>

                        {values.role === value && (
                          <Check size={16} className="ml-auto text-[#38BDF8]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#7655D9]/10 bg-white p-6 shadow-lg shadow-[#7655D9]/5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#38BDF8]/10 text-[#259BCF]">
                  <Lock size={19} />
                </div>

                <h3 className="font-bold text-[#25213A]">Security Reminder</h3>

                <p className="mt-2 text-sm leading-relaxed text-[#25213A]/55">
                  Create a strong temporary password. Share account credentials securely with the new user.
                </p>
              </div>
            </motion.aside>
          </div>

          <p className="pb-3 text-center text-xs text-[#25213A]/35">
            Store Rating System · Admin Management Portal
          </p>
        </main>
      </div>
    </div>
  )
}
