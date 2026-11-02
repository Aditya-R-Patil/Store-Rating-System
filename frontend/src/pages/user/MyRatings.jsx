
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  CalendarDays,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  RefreshCw,
  Search,
  Star,
  Store,
  X,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  Heart,
} from 'lucide-react'
import api from '../../services/api.js'

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating-desc', label: 'Highest Rating' },
  { value: 'rating-asc', label: 'Lowest Rating' },
]

const SORT_COMPARATORS = {
  latest: (a, b) => (b.ratedAtMs ?? 0) - (a.ratedAtMs ?? 0),
  oldest: (a, b) => (a.ratedAtMs ?? 0) - (b.ratedAtMs ?? 0),
  'rating-desc': (a, b) => b.userRating - a.userRating,
  'rating-asc': (a, b) => a.userRating - b.userRating,
}

const COLORS = {
  midnight: '#241044',
  violet: '#7655D9',
  electric: '#38BDF8',
  lavender: '#F5F3FF',
  charcoal: '#25213A',
  gold: '#FBBF24',
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function firstValue(raw, ...keys) {
  for (const key of keys) {
    const value = raw[key]
    if (value !== null && value !== undefined && value !== '') return value
  }
  return null
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeRatedStore(raw) {
  const ratedAt = firstValue(
    raw,
    'rating_updated_at',
    'ratingUpdatedAt',
    'updated_at',
    'updatedAt',
    'rated_at',
    'ratedAt'
  )

  const ratedAtMs = ratedAt ? Date.parse(ratedAt) : NaN

  let imageUrl = firstValue(raw, 'image_url', 'imageUrl') || ''

  if (imageUrl && imageUrl.startsWith('/uploads/')) {
    imageUrl = `http://localhost:5000${imageUrl}`
  }

  return {
    id: raw.id,
    name: firstValue(raw, 'name', 'store_name', 'storeName') ?? '',
    address: firstValue(raw, 'address') ?? '',
    category: firstValue(raw, 'category') ?? '',
    imageUrl,
    averageRating: toNumberOrNull(
      firstValue(raw, 'average_rating', 'averageRating')
    ),
    userRating: toNumberOrNull(
      firstValue(raw, 'user_rating', 'userRating', 'my_rating', 'myRating')
    ),
    ratedAt,
    ratedAtMs: Number.isFinite(ratedAtMs) ? ratedAtMs : null,
  }
}

async function fetchMyRatings(signal) {
  const { data } = await api.get('/user/stores', { signal })

  const list = Array.isArray(data) ? data : data?.stores

  if (!Array.isArray(list)) {
    throw new Error('Unexpected response from the server.')
  }

  return list
    .map(normalizeRatedStore)
    .filter((store) => store.userRating !== null)
}

function getErrorMessage(error, fallback) {
  if (error.response?.data?.message) return error.response.data.message

  if (error.request && !error.response) {
    return 'Cannot reach the server. Please make sure the backend is running.'
  }

  return error.message || fallback
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
        ? 'bg-white/10 text-[#38BDF8] shadow-lg shadow-black/10'
        : 'text-[#F5F3FF]/70 hover:bg-white/5 hover:text-white'
    }`

  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-violet-500/30"
          style={{
            background: 'linear-gradient(135deg, #7655D9, #38BDF8)',
          }}
        >
          <Store className="h-6 w-6 text-white" />
        </span>

        <div>
          <p className="text-base font-bold tracking-wide text-white">
            Store Rating
          </p>
          <p className="text-xs text-[#F5F3FF]/50">
            Management System
          </p>
        </div>
      </div>

      <div className="px-5 pb-3 pt-7">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#F5F3FF]/35">
          Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        <NavLink
          to="/user/dashboard"
          onClick={onNavigate}
          className={navClass}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="pointer-events-none absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#38BDF8]" />
              )}
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              Dashboard
              <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
            </>
          )}
        </NavLink>

        <NavLink
          to="/user/ratings"
          onClick={onNavigate}
          className={navClass}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="pointer-events-none absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#38BDF8]" />
              )}
              <Star className="h-5 w-5 shrink-0" />
              My Ratings
              <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
            </>
          )}
        </NavLink>

        {/* Updated Change Password Link */}
        <NavLink
          to="/user/change-password"
          onClick={onNavigate}
          className={navClass}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="pointer-events-none absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#38BDF8]" />
              )}
              <KeyRound className="h-5 w-5 shrink-0" />
              Change Password
              <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
            </>
          )}
        </NavLink>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #7655D9, #38BDF8)',
            }}
          >
            {initials}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {userName || 'User'}
            </p>
            <p className="truncate text-xs text-[#F5F3FF]/50">
              {userEmail || 'Signed in'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#F5F3FF]/70 transition-all hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  )
}

function StarRow({ value, size = 'h-5 w-5', label }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((index) => {
        const filled = value >= index + 1

        return (
          <Star
            key={index}
            className={`${size} shrink-0 ${
              filled ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-gray-300'
            }`}
          />
        )
      })}
    </span>
  )
}

function SummaryCard({ label, value, icon: Icon, footnote, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-lg shadow-[#7655D9]/10 transition-all duration-300 hover:shadow-xl hover:shadow-[#7655D9]/20"
    >
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-60 blur-3xl transition-all duration-500 group-hover:opacity-100"
        style={{ backgroundColor: '#38BDF8' }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#25213A]/60">{label}</p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#25213A]">
            {value}
          </p>

          {footnote && (
            <p className="mt-1 text-xs font-medium text-[#25213A]/50">
              {footnote}
            </p>
          )}
        </div>

        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #7655D9, #38BDF8)',
          }}
        >
          <Icon className="h-6 w-6 text-white" />
        </span>
      </div>

      <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-[#F5F3FF]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          transition={{ duration: 1, delay: index * 0.1 }}
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #7655D9, #38BDF8)',
          }}
        />
      </div>
    </motion.div>
  )
}

function RatedStoreCard({ store, index }) {
  const [imageFailed, setImageFailed] = useState(false)

  const showImage = store.imageUrl && !imageFailed

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.06 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-3xl border border-white bg-white shadow-lg shadow-[#7655D9]/10 transition-all duration-300 hover:shadow-xl hover:shadow-[#7655D9]/20"
    >
      <div className="relative h-52 overflow-hidden bg-[#F5F3FF]">
        {showImage ? (
          <img
            src={store.imageUrl}
            alt={`${store.name} store`}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F5F3FF] to-[#38BDF8]/20">
            <ImageIcon className="h-14 w-14 text-[#7655D9]/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#241044]/60 via-transparent to-transparent" />

        {store.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#241044] shadow-lg backdrop-blur-md">
            {store.category}
          </span>
        )}

        <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#241044] shadow-lg">
          <Heart className="h-3.5 w-3.5 fill-[#7655D9] text-[#7655D9]" />
          Rated
        </span>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#25213A] transition-colors group-hover:text-[#7655D9]">
            {store.name || 'Unnamed Store'}
          </h3>

          {store.address && (
            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-[#25213A]/60">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7655D9]" />
              <span>{store.address}</span>
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-2xl bg-[#F5F3FF] p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#25213A]/55">
                Your Rating
              </p>
              <span className="rounded-lg bg-white px-2.5 py-1 text-sm font-extrabold text-[#7655D9] shadow-sm">
                {store.userRating}/5
              </span>
            </div>

            <StarRow
              value={store.userRating}
              label={`Your rating: ${store.userRating} out of 5 stars`}
            />
          </div>

          <div className="h-px bg-[#7655D9]/10" />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#25213A]/55">
                Store Average
              </p>

              <span className="text-sm font-extrabold text-[#25213A]">
                {store.averageRating === null
                  ? 'N/A'
                  : store.averageRating.toFixed(1)}
              </span>
            </div>

            {store.averageRating === null ? (
              <p className="text-xs text-[#25213A]/50">No ratings available</p>
            ) : (
              <StarRow
                value={store.averageRating}
                size="h-4 w-4"
                label={`Store average: ${store.averageRating.toFixed(1)} out of 5 stars`}
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[#7655D9]/10 pt-4 text-xs font-medium text-[#25213A]/55">
          <CalendarDays className="h-4 w-4 text-[#7655D9]" />
          Rated on {formatDate(store.ratedAt)}
        </div>
      </div>
    </motion.article>
  )
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-white bg-white shadow-lg">
      <div className="h-52 bg-[#7655D9]/10" />

      <div className="space-y-4 p-5">
        <div className="h-6 w-2/3 rounded-lg bg-[#7655D9]/10" />
        <div className="h-4 w-full rounded-lg bg-[#7655D9]/10" />
        <div className="h-28 rounded-2xl bg-[#7655D9]/10" />
        <div className="h-4 w-1/2 rounded-lg bg-[#7655D9]/10" />
      </div>
    </div>
  )
}

function StateMessage({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white bg-white px-6 py-16 text-center shadow-lg shadow-[#7655D9]/10"
    >
      <span
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, #7655D9/15, #38BDF8/15)',
          backgroundColor: '#F5F3FF',
        }}
      >
        <Icon className="h-9 w-9 text-[#7655D9]" />
      </span>

      <h3 className="text-xl font-bold text-[#25213A]">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#25213A]/60">
        {description}
      </p>

      {action}
    </motion.div>
  )
}

export default function MyRatings() {
  const navigate = useNavigate()

  const [user] = useState(readStoredUser)
  const [ratings, setRatings] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState('latest')

  const userName = user?.name || ''
  const userEmail = user?.email || ''

  const initials = (userName || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    const controller = new AbortController()

    setStatus('loading')
    setErrorMessage('')

    fetchMyRatings(controller.signal)
      .then((list) => {
        setRatings(list)
        setStatus('success')
      })
      .catch((error) => {
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return

        setErrorMessage(
          getErrorMessage(error, 'Something went wrong while loading your ratings.')
        )
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadKey])

  const summary = useMemo(() => {
    const total = ratings.length

    const average = total
      ? ratings.reduce((sum, store) => sum + store.userRating, 0) / total
      : null

    const highest = total
      ? Math.max(...ratings.map((store) => store.userRating))
      : null

    return { total, average, highest }
  }, [ratings])

  const visibleRatings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const filtered = query
      ? ratings.filter((store) => store.name.toLowerCase().includes(query))
      : ratings

    return [...filtered].sort(SORT_COMPARATORS[sortKey])
  }, [ratings, searchTerm, sortKey])

  const closeDrawer = () => setIsDrawerOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  const renderGrid = () => {
    if (status === 'loading') {
      return [0, 1, 2, 3, 4, 5].map((item) => (
        <CardSkeleton key={item} />
      ))
    }

    if (status === 'error') {
      return (
        <StateMessage
          icon={Star}
          title="Could not load your ratings"
          description={errorMessage}
          action={
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-5 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: COLORS.violet }}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          }
        />
      )
    }

    if (ratings.length === 0) {
      return (
        <StateMessage
          icon={Star}
          title="No ratings yet!"
          description="You haven't rated any stores. Explore stores and share your experience with others."
          action={
            <button
              type="button"
              onClick={() => navigate('/user/dashboard')}
              className="mt-5 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: COLORS.violet }}
            >
              <Store className="h-4 w-4" />
              Explore Stores
            </button>
          }
        />
      )
    }

    if (visibleRatings.length === 0) {
      return (
        <StateMessage
          icon={Search}
          title="No matching stores found"
          description="We couldn't find any rated stores matching your search."
          action={
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-5 rounded-xl border border-[#7655D9]/30 bg-[#F5F3FF] px-5 py-3 text-sm font-semibold text-[#7655D9] transition-all hover:bg-[#7655D9] hover:text-white"
            >
              Clear Search
            </button>
          }
        />
      )
    }

    return (
      <AnimatePresence mode="popLayout">
        {visibleRatings.map((store, index) => (
          <RatedStoreCard
            key={store.id}
            store={store}
            index={index}
          />
        ))}
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] lg:flex">
      {/* Desktop Sidebar */}
      <aside
        className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col text-white lg:flex"
        style={{
          background: 'linear-gradient(180deg, #241044 0%, #1A0C33 100%)',
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
              onClick={closeDrawer}
              className="fixed inset-0 z-40 bg-[#25213A]/60 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col text-white lg:hidden"
              style={{
                background: 'linear-gradient(180deg, #241044 0%, #1A0C33 100%)',
              }}
            >
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <SidebarContent
                userName={userName}
                userEmail={userEmail}
                onNavigate={closeDrawer}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#7655D9]/10 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="rounded-xl p-2 text-[#25213A] transition-colors hover:bg-[#7655D9]/10 hover:text-[#7655D9] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-lg font-bold text-[#25213A]">
                My Ratings
              </p>
              <p className="text-xs text-[#25213A]/50">
                Manage your feedback history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#25213A]">
                {userName || 'User'}
              </p>
              <p className="text-xs font-medium text-[#7655D9]">
                Normal User
              </p>
            </div>

            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg shadow-[#7655D9]/20"
              style={{
                background: 'linear-gradient(135deg, #7655D9, #38BDF8)',
              }}
            >
              {initials}
            </span>
          </div>
        </header>

        <main className="flex-1 space-y-7 p-4 sm:p-6 lg:p-8">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[28px] p-7 text-white shadow-2xl shadow-[#7655D9]/20 sm:p-10 lg:p-12"
            style={{
              background:
                'linear-gradient(115deg, #241044 0%, #432477 55%, #315B91 100%)',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#38BDF8] blur-3xl"
            />

            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 8, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="pointer-events-none absolute bottom-[-45px] right-[20%] h-40 w-40 rounded-full border border-white/10 bg-white/5"
            />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-md">
                  <Sparkles className="h-4 w-4 text-[#38BDF8]" />
                  YOUR FEEDBACK SPACE
                </span>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  My Ratings
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                  Every review makes a difference. Track your store ratings,
                  explore your feedback history and see how your experiences
                  help others.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/80">
                  <Star className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]" />
                  Your opinion matters!
                </div>
              </div>

              <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl md:flex">
                <div className="flex h-24 w-24 items-center justify-center rounded-[25px] bg-white/10">
                  <Star className="h-14 w-14 fill-[#FBBF24] text-[#FBBF24]" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Summary Heading */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#7655D9]">
                Overview
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#25213A] sm:text-2xl">
                Your Rating Statistics
              </h2>
            </div>

            <span className="rounded-full border border-[#7655D9]/15 bg-white px-4 py-2 text-xs font-semibold text-[#25213A]/60 shadow-sm">
              Personal Summary
            </span>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {status === 'success' ? (
              <>
                <SummaryCard
                  label="Total Stores Rated"
                  value={summary.total.toLocaleString()}
                  icon={MessageSquare}
                  footnote="Stores you have reviewed"
                  index={0}
                />

                <SummaryCard
                  label="Average Rating Given"
                  value={
                    summary.average === null
                      ? '-'
                      : summary.average.toFixed(1)
                  }
                  icon={TrendingUp}
                  footnote={
                    summary.average === null ? 'No ratings yet' : 'Out of 5 stars'
                  }
                  index={1}
                />

                <SummaryCard
                  label="Highest Rating Given"
                  value={
                    summary.highest === null
                      ? '-'
                      : `${summary.highest}/5`
                  }
                  icon={Award}
                  footnote="Your highest store rating"
                  index={2}
                />
              </>
            ) : (
              [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-white bg-white p-6 shadow-lg"
                >
                  <div className="flex justify-between">
                    <div className="space-y-3">
                      <div className="h-4 w-32 rounded bg-[#7655D9]/10" />
                      <div className="h-8 w-20 rounded bg-[#7655D9]/10" />
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-[#7655D9]/10" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Search and Filter */}
          <section className="rounded-3xl border border-white bg-white p-5 shadow-lg shadow-[#7655D9]/5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#25213A]">
                  Rating History
                </h2>
                <p className="mt-1 text-xs text-[#25213A]/50">
                  Search and organize your rated stores
                </p>
              </div>

              <span className="flex items-center gap-2 rounded-xl bg-[#F5F3FF] px-3 py-2 text-xs font-semibold text-[#7655D9]">
                <ListFilter className="h-4 w-4" />
                Filters
              </span>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7655D9]/60" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by store name..."
                  aria-label="Search ratings by store name"
                  className="w-full rounded-2xl border border-[#7655D9]/15 bg-[#F5F3FF]/60 py-3.5 pl-12 pr-4 text-sm text-[#25213A] outline-none transition-all placeholder:text-[#25213A]/40 focus:border-[#7655D9] focus:bg-white focus:ring-4 focus:ring-[#7655D9]/10"
                />
              </div>

              <div className="relative md:w-64">
                <ListFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7655D9]" />

                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value)}
                  aria-label="Sort ratings"
                  className="w-full appearance-none rounded-2xl border border-[#7655D9]/15 bg-[#F5F3FF]/60 py-3.5 pl-11 pr-4 text-sm font-medium text-[#25213A] outline-none transition-all focus:border-[#7655D9] focus:bg-white focus:ring-4 focus:ring-[#7655D9]/10"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {status === 'success' && ratings.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#7655D9]/10 pt-4">
                <p className="text-xs font-medium text-[#25213A]/55">
                  Showing{' '}
                  <span className="font-bold text-[#7655D9]">
                    {visibleRatings.length}
                  </span>{' '}
                  of {ratings.length} rated stores
                </p>

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-xs font-semibold text-[#7655D9] hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Store Cards Heading */}
          {status === 'success' && ratings.length > 0 && (
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#25213A]">
                  Rated Stores
                </h2>
                <p className="mt-1 text-xs text-[#25213A]/50">
                  Your submitted feedback
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#7655D9] shadow-sm">
                <Store className="h-5 w-5" />
              </div>
            </div>
          )}

          {/* Ratings Grid */}
          <div className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {renderGrid()}
          </div>

          {/* Footer */}
          <footer className="border-t border-[#7655D9]/10 pt-6 text-center">
            <p className="text-xs text-[#25213A]/45">
              Made with care for a better store experience.
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
