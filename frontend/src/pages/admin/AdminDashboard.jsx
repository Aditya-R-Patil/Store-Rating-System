
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, animate, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  AlertTriangle,
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Store,
  UserPlus,
  Users,
  X,
  Activity,
  Sparkles,
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

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Manage Users', to: '/admin/users', icon: Users },
  { label: 'Manage Stores', to: '/admin/stores', icon: Store },
  { label: 'Add User', to: '/admin/users/new', icon: UserPlus },
  { label: 'Add Store', to: '/admin/stores/new', icon: Plus },
]

const STAT_CARDS = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    description: 'Registered platform users',
    icon: Users,
    gradient: 'linear-gradient(135deg, #7655D9, #38BDF8)',
  },
  {
    key: 'totalStores',
    label: 'Total Stores',
    description: 'Stores on the platform',
    icon: Store,
    gradient: 'linear-gradient(135deg, #241044, #7655D9)',
  },
  {
    key: 'totalRatings',
    label: 'Total Ratings',
    description: 'Ratings submitted by users',
    icon: Star,
    gradient: 'linear-gradient(135deg, #38BDF8, #7655D9)',
  },
]

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function parseDashboardStats(data) {
  const source = data?.dashboard ?? data
  const stats = {}

  for (const { key } of STAT_CARDS) {
    const value = Number(source?.[key])

    if (!Number.isFinite(value)) {
      throw new Error('Dashboard statistics are missing from the server response.')
    }

    stats[key] = value
  }

  return stats
}

function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.request && !error.response) {
    return 'Cannot reach the server. Please make sure the backend is running.'
  }

  return error.message || 'Something went wrong while loading the dashboard.'
}

function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.3,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })

    return () => controls.stop()
  }, [value])

  return display.toLocaleString()
}

function StatCard({ item, value, index }) {
  const Icon = item.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-xl shadow-[#241044]/5 transition-all duration-300 hover:shadow-2xl"
    >
      <div
        className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-25"
        style={{ background: item.gradient }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#77718A' }}>
            {item.label}
          </p>

          <p className="mt-4 text-4xl font-extrabold tracking-tight" style={{ color: COLORS.charcoal }}>
            <AnimatedCount value={value} />
          </p>

          <p className="mt-2 text-xs" style={{ color: '#9690A8' }}>
            {item.description}
          </p>
        </div>

        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
          style={{ background: item.gradient }}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>

      <div
        className="mt-6 h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: '#F0ECF8' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
          className="h-full rounded-full"
          style={{ background: item.gradient }}
        />
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-6 shadow-lg">
      <div className="flex justify-between">
        <div className="space-y-4">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-10 w-20 rounded bg-gray-200" />
          <div className="h-3 w-36 rounded bg-gray-200" />
        </div>
        <div className="h-14 w-14 rounded-2xl bg-gray-200" />
      </div>
    </div>
  )
}

function SidebarContent({ onNavigate, onLogout }) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-7">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7655D9, #38BDF8)' }}
        >
          <Store className="h-6 w-6 text-white" />
        </div>

        <div>
          <p className="text-base font-bold text-white">Store Rating</p>
          <p className="text-xs text-purple-200">Admin Console</p>
        </div>
      </div>

      <div className="mx-5 mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
          <ShieldCheck className="h-4 w-4" />
          SYSTEM ADMINISTRATOR
        </div>
        <p className="mt-2 text-sm text-white/70">
          Manage your platform from one place.
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[2px] text-purple-300/60">
          Main Menu
        </p>

        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className="block rounded-xl px-4 py-3 transition-all duration-200"
            style={({ isActive }) => ({
              background: isActive ? 'rgba(118,85,217,0.25)' : 'transparent',
              color: isActive ? COLORS.electric : '#D7CDED',
              borderLeft: isActive ? `3px solid ${COLORS.electric}` : '3px solid transparent',
            })}
          >
            {({ isActive }) => (
              <span className="flex items-center gap-3 text-sm font-semibold">
                <Icon className="h-5 w-5" />
                {label}
                {isActive && <span className="ml-auto h-2 w-2 rounded-full" style={{ background: COLORS.electric }} />}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:bg-red-500/15 hover:text-red-300"
          style={{ color: '#D7CDED' }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  )
}

const QUICK_ACTIONS = [
  {
    title: 'Add New User',
    description: 'Create an account for a user or store owner.',
    icon: UserPlus,
    to: '/admin/users/new',
    color: '#7655D9',
  },
  {
    title: 'Add New Store',
    description: 'Register a new store on the platform.',
    icon: Plus,
    to: '/admin/stores/new',
    color: '#0284C7',
  },
  {
    title: 'Manage Users',
    description: 'View and manage registered accounts.',
    icon: Users,
    to: '/admin/users',
    color: '#6D28D9',
  },
  {
    title: 'Manage Stores',
    description: 'View and manage all listed stores.',
    icon: Store,
    to: '/admin/stores',
    color: '#0E7490',
  },
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [user] = useState(readStoredUser)
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const adminName = user?.name || 'Administrator'
  const firstName = adminName.split(' ')[0]

  const initials = adminName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    const controller = new AbortController()

    setStatus('loading')

    api
      .get('/admin/dashboard', {
        signal: controller.signal,
      })
      .then(({ data }) => {
        console.log('Dashboard API Response:', data)
        setStats(parseDashboardStats(data))
        setStatus('success')
        setErrorMessage('')
      })
      .catch((error) => {
        if (axios.isCancel(error)) return

        setErrorMessage(getErrorMessage(error))
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadKey])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <div className="min-h-screen lg:flex" style={{ background: COLORS.lavender }}>

      <aside
        className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col lg:flex"
        style={{ background: 'linear-gradient(180deg, #241044 0%, #1A0C33 100%)' }}
      >
        <SidebarContent onLogout={handleLogout} />
      </aside>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col lg:hidden"
              style={{ background: 'linear-gradient(180deg, #241044, #1A0C33)' }}
            >
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="absolute right-4 top-4 rounded-lg p-2 text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>

              <SidebarContent
                onNavigate={closeDrawer}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">

        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/70 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="rounded-xl p-2 hover:bg-purple-100 lg:hidden"
              style={{ color: COLORS.midnight }}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <p className="text-base font-bold sm:text-lg" style={{ color: COLORS.charcoal }}>
                Welcome back, {firstName}!
              </p>
              <p className="text-xs sm:text-sm" style={{ color: '#89829C' }}>
                Here's what's happening with your platform today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold" style={{ color: COLORS.charcoal }}>
                {adminName}
              </p>
              <p className="text-xs font-semibold" style={{ color: COLORS.violet }}>
                System Administrator
              </p>
            </div>

            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7655D9, #38BDF8)' }}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 overflow-hidden rounded-3xl p-6 shadow-xl sm:p-8"
            style={{
              background: 'linear-gradient(115deg, #241044 0%, #432477 55%, #315B91 100%)',
            }}
          >
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-purple-400/20 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                <Sparkles className="h-4 w-4" />
                ADMIN CONTROL CENTER
              </div>

              <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                Dashboard Overview
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-purple-100 sm:text-base">
                Monitor your users, stores and ratings. Manage your entire Store Rating System from one dashboard.
              </p>

              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                disabled={status === 'loading'}
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: COLORS.violet }}
              >
                <RefreshCw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
                {status === 'loading' ? 'Loading...' : 'Refresh Dashboard'}
              </button>
            </div>
          </motion.div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: COLORS.charcoal }}>
                Platform Statistics
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#89829C' }}>
                A quick summary of your platform.
              </p>
            </div>

            <Activity className="h-6 w-6" style={{ color: COLORS.violet }} />
          </div>

          {status === 'loading' && (
            <div className="grid gap-5 md:grid-cols-3">
              {STAT_CARDS.map((item) => (
                <SkeletonCard key={item.key} />
              ))}
            </div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-200 bg-white p-6 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-red-500" />
                <div>
                  <p className="font-bold" style={{ color: COLORS.charcoal }}>
                    Could not load dashboard data
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
                style={{ background: COLORS.violet }}
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </motion.div>
          )}

          {status === 'success' && stats && (
            <div className="grid gap-5 md:grid-cols-3">
              {STAT_CARDS.map((item, index) => (
                <StatCard
                  key={item.key}
                  item={item}
                  value={stats[item.key]}
                  index={index}
                />
              ))}
            </div>
          )}

          <div className="mb-5 mt-10">
            <h2 className="text-xl font-extrabold" style={{ color: COLORS.charcoal }}>
              Quick Actions
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#89829C' }}>
              Frequently used administration tools.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map((item, index) => {
              const Icon = item.icon

              return (
                <motion.button
                  key={item.title}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(item.to)}
                  className="group rounded-2xl border border-white bg-white p-5 text-left shadow-lg shadow-[#241044]/5 transition-all hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: `${item.color}18`, color: item.color }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <ArrowUpRight
                      className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                      style={{ color: item.color }}
                    />
                  </div>

                  <h3 className="mt-5 text-base font-bold" style={{ color: COLORS.charcoal }}>
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed" style={{ color: '#89829C' }}>
                    {item.description}
                  </p>

                  <span
                    className="mt-5 inline-flex items-center gap-2 text-xs font-bold"
                    style={{ color: item.color }}
                  >
                    Open Section <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </motion.button>
              )
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-purple-100 bg-white p-5 shadow-lg shadow-purple-900/5 sm:p-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: '#F0EAFF', color: COLORS.violet }}
              >
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-bold" style={{ color: COLORS.charcoal }}>
                  Administrator Access
                </h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: '#89829C' }}>
                  You are viewing the system administrator panel. Use the sidebar or quick actions to manage users, stores and platform activities.
                </p>
              </div>
            </div>
          </div>

          <footer className="py-8 text-center text-xs" style={{ color: '#9690A8' }}>
            Store Rating System · Admin Dashboard
          </footer>

        </main>
      </div>
    </div>
  )
}
