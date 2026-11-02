
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Award,
  Bell,
  CalendarDays,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import api from '../../services/api.js'

const LEVELS = [5, 4, 3, 2, 1]

const C = {
  purple: '#241044',
  violet: '#7655D9',
  blue: '#38BDF8',
  light: '#F5F3FF',
  dark: '#25213A',
  gold: '#FBBF24',
}

const NAV_ITEMS = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/store', label: 'My Store', icon: Store },
  { to: '/owner/ratings', label: 'Users Who Rated', icon: Users },
  { to: '/owner/change-password', label: 'Change Password', icon: KeyRound },
]

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

function formatDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function normalizeRating(raw, index, store) {
  return {
    id: raw.id ?? `${store.id}-${index}`,
    storeId: store.id,
    storeName: store.name || 'Store',
    customerName:
      raw.customer_name ||
      raw.customerName ||
      raw.user_name ||
      raw.userName ||
      raw.name ||
      'Anonymous',
    customerEmail:
      raw.customer_email ||
      raw.customerEmail ||
      raw.user_email ||
      raw.userEmail ||
      raw.email ||
      '',
    rating: Number(raw.rating ?? raw.stars ?? 0),
    ratedAt:
      raw.created_at ||
      raw.createdAt ||
      raw.updated_at ||
      raw.updatedAt ||
      raw.rated_at ||
      raw.ratedAt,
  }
}

function normalizeDashboard(raw) {
  const stores = Array.isArray(raw?.stores) ? raw.stores : []

  const normalizedStores = stores.map((store) => {
    const ratings = Array.isArray(store.ratings) ? store.ratings : []

    return {
      ...store,
      id: store.id,
      name: store.name || 'Unnamed Store',
      averageRating: Number(store.averageRating || 0),
      totalRatings: Number(store.totalRatings || 0),
      ratings: ratings.map((rating, index) =>
        normalizeRating(rating, index, store)
      ),
    }
  })

  const allRatings = normalizedStores.flatMap((store) => store.ratings)

  const totalRatings = normalizedStores.reduce(
    (sum, store) => sum + store.totalRatings,
    0
  )

  const weightedRating = normalizedStores.reduce(
    (sum, store) => sum + store.averageRating * store.totalRatings,
    0
  )

  const averageRating =
    totalRatings > 0 ? weightedRating / totalRatings : null

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  allRatings.forEach((rating) => {
    if (distribution[rating.rating] !== undefined) {
      distribution[rating.rating] += 1
    }
  })

  const recentRatings = [...allRatings]
    .sort(
      (a, b) =>
        new Date(b.ratedAt || 0).getTime() -
        new Date(a.ratedAt || 0).getTime()
    )
    .slice(0, 10)

  return {
    stores: normalizedStores,
    totalStores: normalizedStores.length,
    averageRating,
    totalRatings,
    fiveStarCount: distribution[5],
    totalCustomers: allRatings.length,
    distribution,
    recentRatings,
  }
}

async function fetchDashboard(signal) {
  const { data } = await api.get('/owner/dashboard', { signal })

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Unexpected response from the server.')
  }

  return normalizeDashboard(data)
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    (error.request && !error.response
      ? 'Cannot reach the server. Please make sure the backend is running.'
      : error.message || 'Something went wrong.')
  )
}

function StarRow({ value = 0, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((number) => (
        <Star
          key={number}
          className={`${size} ${
            value >= number
              ? 'fill-[#FBBF24] text-[#FBBF24]'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function Sidebar({ user, onNavigate, onLogout }) {
  const navClass = ({ isActive }) =>
    `relative flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'bg-white/10 text-[#38BDF8] shadow-lg'
        : 'text-[#F5F3FF]/65 hover:bg-white/5 hover:text-white'
    }`

  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#7655D9,#38BDF8)' }}
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
          style={{ background: 'linear-gradient(135deg,#7655D9,#38BDF8)' }}
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
                  <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#38BDF8]" />
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

function StatCard({ label, value, subtitle, icon: Icon, index, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      whileHover={{ y: -7 }}
      className="group relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-lg shadow-[#7655D9]/10"
    >
      <div
        className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-10 blur-2xl"
        style={{ background: color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#25213A]/55">{label}</p>
          <h3 className="mt-3 text-3xl font-extrabold text-[#25213A]">
            {value}
          </h3>
          <p className="mt-2 text-xs text-[#25213A]/45">{subtitle}</p>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: color }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="relative mt-6 h-1 overflow-hidden rounded-full bg-[#F5F3FF]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          transition={{ duration: 1, delay: index * 0.12 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  )
}

function RatingDistribution({ distribution, totalRatings, averageRating }) {
  if (!totalRatings) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Star className="mb-4 h-10 w-10 text-[#7655D9]" />
        <h3 className="font-bold text-[#25213A]">No ratings yet</h3>
        <p className="mt-2 text-sm text-[#25213A]/55">
          Customer rating statistics will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
      <div className="rounded-3xl bg-[#F5F3FF] p-7 text-center">
        <p className="text-sm font-semibold text-[#25213A]/50">
          Overall Rating
        </p>

        <h3 className="mt-3 text-6xl font-extrabold text-[#241044]">
          {averageRating.toFixed(1)}
        </h3>

        <div className="mt-4 flex justify-center">
          <StarRow value={averageRating} size="h-6 w-6" />
        </div>

        <p className="mt-4 text-sm text-[#25213A]/55">
          Based on {totalRatings.toLocaleString()} customer ratings
        </p>
      </div>

      <div className="space-y-5">
        {LEVELS.map((level, index) => {
          const count = distribution[level] || 0
          const percent = totalRatings ? (count / totalRatings) * 100 : 0

          return (
            <div
              key={level}
              className="grid grid-cols-[55px_1fr_75px] items-center gap-3"
            >
              <span className="flex items-center gap-1 text-sm font-bold text-[#25213A]">
                {level}
                <Star className="h-3.5 w-3.5 fill-[#FBBF24] text-[#FBBF24]" />
              </span>

              <div className="h-3 overflow-hidden rounded-full bg-[#F5F3FF]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg,#7655D9,#38BDF8)',
                  }}
                />
              </div>

              <span className="text-right text-xs font-semibold text-[#25213A]/60">
                {percent.toFixed(0)}% ({count})
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentRatings({ ratings }) {
  return (
    <div>
      {ratings.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <MessageSquare className="mb-4 h-10 w-10 text-[#7655D9]" />
          <h3 className="font-bold text-[#25213A]">
            No customer ratings yet
          </h3>
          <p className="mt-2 text-sm text-[#25213A]/55">
            Recent customer feedback will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead>
              <tr className="border-b border-[#7655D9]/10 bg-[#F5F3FF]/60 text-[11px] uppercase tracking-wider text-[#25213A]/55">
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Store</th>
                <th className="px-6 py-4 font-bold">Email Address</th>
                <th className="px-6 py-4 font-bold">Rating</th>
                <th className="px-6 py-4 font-bold">Review Date</th>
              </tr>
            </thead>

            <tbody>
              {ratings.map((rating, index) => (
                <motion.tr
                  key={rating.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#7655D9]/5 hover:bg-[#F5F3FF]/70"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{
                          background: 'linear-gradient(135deg,#7655D9,#38BDF8)',
                        }}
                      >
                        {getInitials(rating.customerName)}
                      </div>

                      <span className="text-sm font-semibold text-[#25213A]">
                        {rating.customerName}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-[#7655D9]">
                    {rating.storeName}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#25213A]/60">
                    {rating.customerEmail || '-'}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StarRow value={rating.rating} />
                      <span className="text-xs font-bold text-[#25213A]">
                        {rating.rating}/5
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#25213A]/60">
                      <CalendarDays className="h-4 w-4 text-[#7655D9]" />
                      {formatDate(rating.ratedAt)}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-40 rounded-3xl bg-white shadow-lg" />
        ))}
      </div>

      <div className="h-60 rounded-3xl bg-white shadow-lg" />
      <div className="h-72 rounded-3xl bg-white shadow-lg" />
    </div>
  )
}

export default function OwnerDashboard() {
  const navigate = useNavigate()

  const [user] = useState(readStoredUser)
  const [dashboard, setDashboard] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    setStatus('loading')
    setErrorMessage('')

    fetchDashboard(controller.signal)
      .then((data) => {
        setDashboard(data)
        setStatus('success')
      })
      .catch((error) => {
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return

        const message = getErrorMessage(error)
        setErrorMessage(message)
        setStatus('error')
        toast.error(message)
      })

    return () => controller.abort()
  }, [reloadKey])

  const stats = useMemo(() => {
    const format = (value) =>
      value === null || value === undefined ? '-' : value.toLocaleString()

    return {
      stores: format(dashboard?.totalStores),
      average:
        dashboard?.averageRating == null
          ? '-'
          : dashboard.averageRating.toFixed(1),
      total: format(dashboard?.totalRatings),
      fiveStar: format(dashboard?.fiveStarCount),
    }
  }, [dashboard])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully.')
    navigate('/login', { replace: true })
  }

  const refreshDashboard = () => {
    if (status !== 'loading') {
      setReloadKey((key) => key + 1)
    }
  }

  const renderDashboard = () => {
    if (status === 'loading') return <LoadingSkeleton />

    if (status === 'error') {
      return (
        <div className="rounded-3xl border border-white bg-white p-12 text-center shadow-xl">
          <X className="mx-auto mb-4 h-10 w-10 text-red-500" />

          <h3 className="text-xl font-bold text-[#25213A]">
            Could not load dashboard
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-[#25213A]/55">
            {errorMessage}
          </p>

          <button
            onClick={refreshDashboard}
            className="mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ background: C.violet }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-7">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="My Stores"
            value={stats.stores}
            subtitle="Stores assigned to you"
            icon={Store}
            color="linear-gradient(135deg,#7655D9,#241044)"
            index={0}
          />

          <StatCard
            label="Average Store Rating"
            value={stats.average}
            subtitle="Combined average out of 5"
            icon={Star}
            color="linear-gradient(135deg,#FBBF24,#F59E0B)"
            index={1}
          />

          <StatCard
            label="Total Ratings"
            value={stats.total}
            subtitle="Customer feedback received"
            icon={MessageSquare}
            color="linear-gradient(135deg,#7655D9,#241044)"
            index={2}
          />

          <StatCard
            label="5-Star Ratings"
            value={stats.fiveStar}
            subtitle="Excellent customer experiences"
            icon={Award}
            color="linear-gradient(135deg,#38BDF8,#7655D9)"
            index={3}
          />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white bg-white p-6 shadow-lg shadow-[#7655D9]/10 sm:p-8"
        >
          <div className="mb-7">
            <h2 className="text-xl font-bold text-[#25213A]">
              Combined Rating Overview
            </h2>

            <p className="mt-1 text-sm text-[#25213A]/50">
              Rating statistics across all your stores
            </p>
          </div>

          <RatingDistribution
            averageRating={dashboard.averageRating}
            totalRatings={dashboard.totalRatings}
            distribution={dashboard.distribution}
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white bg-white shadow-lg shadow-[#7655D9]/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#7655D9]/10 px-6 py-6 sm:px-8">
            <div>
              <h2 className="text-xl font-bold text-[#25213A]">
                Recent Ratings
              </h2>

              <p className="mt-1 text-sm text-[#25213A]/50">
                Latest feedback from all your stores
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[#F5F3FF] px-3 py-2 text-xs font-bold text-[#7655D9]">
              <Users className="h-4 w-4" />
              {dashboard.recentRatings.length} Records
            </div>
          </div>

          <RecentRatings ratings={dashboard.recentRatings} />
        </motion.section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] lg:flex">
      <aside
        className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col lg:flex"
        style={{
          background: 'linear-gradient(180deg,#241044 0%,#1A0C33 100%)',
        }}
      >
        <Sidebar user={user} onLogout={handleLogout} />
      </aside>

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

      <div className="flex min-w-0 flex-1 flex-col">
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
                {dashboard?.totalStores ?? 0} assigned stores
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              onClick={() => toast.info('You have no new notifications.')}
              aria-label="Notifications"
              className="rounded-xl p-2.5 text-[#25213A] transition hover:bg-[#7655D9]/10 hover:text-[#7655D9]"
            >
              <Bell className="h-5 w-5" />
            </button>

            <button
              onClick={refreshDashboard}
              disabled={status === 'loading'}
              className="flex items-center gap-2 rounded-xl border border-[#7655D9]/20 bg-white px-3 py-2.5 text-sm font-semibold text-[#25213A] shadow-sm transition hover:bg-[#F5F3FF] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 text-[#7655D9] ${
                  status === 'loading' ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-[#25213A]">
                {user?.name || 'Store Owner'}
              </p>
              <p className="text-xs text-[#7655D9]">Store Owner</p>
            </div>

            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg,#7655D9,#38BDF8)' }}
            >
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-8 p-4 sm:p-7 lg:p-8">
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
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
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
                  STORE OWNER WORKSPACE
                </span>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Your Store Performance
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                  Monitor your store ratings, understand customer feedback
                  and track your business performance in one place.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/85">
                  <TrendingUp className="h-4 w-4 text-[#38BDF8]" />
                  Your customers, your feedback, your growth.
                </div>
              </div>

              <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl md:flex">
                <div className="flex h-24 w-24 items-center justify-center rounded-[25px] bg-white/10">
                  <Award className="h-14 w-14 text-[#FBBF24]" />
                </div>
              </div>
            </div>
          </motion.section>

          <div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-[#7655D9]">
              Overview
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#25213A]">
              Dashboard Analytics
            </h2>

            <p className="mt-1 text-sm text-[#25213A]/50">
              Here is how your stores are performing.
            </p>
          </div>

          {renderDashboard()}

          <footer className="border-t border-[#7655D9]/10 pt-6 text-center">
            <p className="text-xs text-[#25213A]/45">
              Store Rating Management System · Owner Dashboard
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
