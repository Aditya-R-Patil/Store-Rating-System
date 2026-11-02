import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Store,
  Users,
  X,
} from 'lucide-react'
import api from '../../services/api.js'

const PAGE_SIZE = 8

const NAV_ITEMS = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/store', label: 'My Store', icon: Store },
  { to: '/owner/ratings', label: 'Users Who Rated', icon: Users },
  { to: '/owner/change-password', label: 'Change Password', icon: KeyRound },
]

const STAR_FILTER_OPTIONS = ['all', 5, 4, 3, 2, 1]

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function firstValue(raw, ...keys) {
  for (const key of keys) {
    const value = raw?.[key]
    if (value !== null && value !== undefined && value !== '') return value
  }
  return null
}

function normalizeRating(raw, index) {
  const ratedAt = firstValue(
    raw,
    'created_at',
    'createdAt',
    'updated_at',
    'updatedAt',
    'rated_at',
    'ratedAt'
  )

  const parsedDate = ratedAt ? Date.parse(ratedAt) : NaN

  return {
    id: raw.id ?? index,
    customerName:
      firstValue(
        raw,
        'customer_name',
        'customerName',
        'user_name',
        'userName',
        'name'
      ) ?? 'Anonymous',
    customerEmail:
      firstValue(
        raw,
        'customer_email',
        'customerEmail',
        'user_email',
        'userEmail',
        'email'
      ) ?? '',
    rating: Number(firstValue(raw, 'rating', 'stars')),
    ratedAt,
    ratedAtMs: Number.isFinite(parsedDate) ? parsedDate : null,
  }
}

async function fetchOwnerRatings(signal) {
  const { data } = await api.get('/owner/ratings', { signal })

  const list = Array.isArray(data) ? data : data?.ratings

  if (!Array.isArray(list)) {
    throw new Error('Unexpected response from the server.')
  }

  return list
    .map(normalizeRating)
    .filter((item) => Number.isFinite(item.rating) && item.rating >= 1 && item.rating <= 5)
}

function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.request && !error.response) {
    return 'Cannot reach the server. Please make sure the backend is running.'
  }

  return error.message || 'Something went wrong.'
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

function getInitials(name) {
  return (name || 'S')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function StarDisplay({ rating, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating
              ? 'fill-[#FBBF24] text-[#FBBF24]'
              : 'text-charcoal/20'
          }`}
        />
      ))}
    </div>
  )
}

/* ---------------- SIDEBAR ---------------- */

function SidebarContent({ ownerName, ownerEmail, onNavigate, onLogout }) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7655D9] to-[#38BDF8] shadow-lg shadow-[#38BDF8]/20">
          <Store className="h-6 w-6 text-white" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Store Rating</h2>
          <p className="text-xs text-[#F5F3FF]/50">Management System</p>
        </div>
      </div>

      <div className="mx-4 mb-7 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7655D9] to-[#38BDF8] text-sm font-bold text-white">
            {getInitials(ownerName)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {ownerName || 'Store Owner'}
            </p>
            <p className="truncate text-xs text-[#F5F3FF]/50">
              {ownerEmail || 'Store Owner'}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-[#38BDF8]">
          <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
          Store Owner Account
        </div>
      </div>

      <div className="px-6 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#F5F3FF]/35">
          Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'border border-[#38BDF8]/20 bg-[#7655D9]/25 text-[#38BDF8] shadow-lg shadow-black/10'
                  : 'border border-transparent text-[#F5F3FF]/65 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="owner-active-link"
                    className="absolute left-0 top-2 h-[calc(100%-16px)] w-1 rounded-r-full bg-[#38BDF8]"
                  />
                )}

                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center gap-2 text-xs text-[#F5F3FF]/60">
          <ShieldCheck className="h-4 w-4 text-[#38BDF8]" />
          Secure Owner Panel
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition-all hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  )
}

/* ---------------- SUMMARY CARD ---------------- */

function SummaryCard({ label, value, footnote, icon: Icon, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-2xl border border-white bg-white p-5 shadow-lg shadow-[#7655D9]/10 transition-all hover:shadow-xl hover:shadow-[#7655D9]/20"
    >
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-25 ${color}`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#25213A]/60">{label}</p>

          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-[#25213A]">
            {value}
          </h3>

          {footnote && (
            <p className="mt-1 text-xs text-[#25213A]/50">{footnote}</p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${color}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

/* ---------------- TABLE ---------------- */

function RatingsTable({ ratings }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-b border-[#7655D9]/10 bg-[#F5F3FF]/80">
            {['Customer', 'Email Address', 'Rating', 'Review Date'].map((heading) => (
              <th
                key={heading}
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#25213A]/55"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <AnimatePresence initial={false}>
            {ratings.map((rating, index) => (
              <motion.tr
                key={rating.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.035 }}
                className="border-b border-[#7655D9]/[0.07] transition-colors hover:bg-[#F5F3FF]/70"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7655D9] to-[#38BDF8] text-xs font-bold text-white shadow-md shadow-[#7655D9]/15">
                      {getInitials(rating.customerName)}
                    </div>

                    <span className="text-sm font-semibold text-[#25213A]">
                      {rating.customerName}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-[#25213A]/65">
                    <Mail className="h-4 w-4 text-[#7655D9]" />
                    {rating.customerEmail || '-'}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <StarDisplay rating={rating.rating} />
                    <span className="text-xs font-bold text-[#25213A]/60">
                      {rating.rating}.0 / 5.0
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-[#25213A]/65">
                    <CalendarDays className="h-4 w-4 text-[#7655D9]" />
                    {formatDate(rating.ratedAt)}
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

/* ---------------- PAGINATION ---------------- */

function Pagination({ currentPage, pageCount, onPageChange }) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-[#7655D9]/10 px-5 py-4 sm:flex-row">
      <p className="text-xs font-medium text-[#25213A]/55">
        Page {currentPage} of {pageCount}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 rounded-xl border border-[#7655D9]/20 bg-white px-3 py-2 text-xs font-semibold text-[#25213A] transition hover:bg-[#F5F3FF] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <span className="rounded-xl bg-gradient-to-r from-[#7655D9] to-[#38BDF8] px-4 py-2 text-xs font-bold text-white shadow-md">
          {currentPage}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
          className="flex items-center gap-1 rounded-xl border border-[#7655D9]/20 bg-white px-3 py-2 text-xs font-semibold text-[#25213A] transition hover:bg-[#F5F3FF] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ---------------- LOADING ---------------- */

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-6">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="grid grid-cols-4 gap-5">
          <div className="h-10 rounded-xl bg-[#7655D9]/10" />
          <div className="h-10 rounded-xl bg-[#7655D9]/10" />
          <div className="h-10 rounded-xl bg-[#7655D9]/10" />
          <div className="h-10 rounded-xl bg-[#7655D9]/10" />
        </div>
      ))}
    </div>
  )
}

/* ---------------- MAIN PAGE ---------------- */

export default function OwnerRatings() {
  const navigate = useNavigate()

  const [user] = useState(readStoredUser)
  const [ratings, setRatings] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [starFilter, setStarFilter] = useState('all')
  const [sortKey, setSortKey] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)

  const ownerName = user?.name || ''
  const ownerEmail = user?.email || ''

  /* Fetch Ratings */

  useEffect(() => {
    const controller = new AbortController()

    setStatus('loading')
    setErrorMessage('')

    api
      .get('/owner/ratings', { signal: controller.signal })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.ratings

        if (!Array.isArray(list)) {
          throw new Error('Unexpected response from the server.')
        }

        const normalized = list
          .map(normalizeRating)
          .filter(
            (item) =>
              Number.isFinite(item.rating) &&
              item.rating >= 1 &&
              item.rating <= 5
          )

        setRatings(normalized)
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

  /* Summary */

  const summary = useMemo(() => {
    const total = ratings.length

    const average = total
      ? ratings.reduce((sum, item) => sum + item.rating, 0) / total
      : null

    const fiveStar = ratings.filter((item) => item.rating === 5).length

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    const recent = ratings.filter(
      (item) => item.ratedAtMs !== null && item.ratedAtMs >= weekAgo
    ).length

    return { total, average, fiveStar, recent }
  }, [ratings])

  /* Search, Filter and Sort */

  const visibleRatings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const filtered = ratings.filter((item) => {
      if (starFilter !== 'all' && item.rating !== starFilter) {
        return false
      }

      if (!query) return true

      return (
        item.customerName.toLowerCase().includes(query) ||
        item.customerEmail.toLowerCase().includes(query)
      )
    })

    const direction = sortKey === 'latest' ? -1 : 1

    return [...filtered].sort(
      (a, b) =>
        ((a.ratedAtMs ?? 0) - (b.ratedAtMs ?? 0)) * direction
    )
  }, [ratings, searchTerm, starFilter, sortKey])

  const pageCount = Math.max(
    1,
    Math.ceil(visibleRatings.length / PAGE_SIZE)
  )

  const safePage = Math.min(currentPage, pageCount)

  const pageStart = (safePage - 1) * PAGE_SIZE

  const pagedRatings = visibleRatings.slice(
    pageStart,
    pageStart + PAGE_SIZE
  )

  const hasActiveFilters =
    searchTerm.trim() !== '' || starFilter !== 'all'

  const resetPage = () => setCurrentPage(1)

  const clearFilters = () => {
    setSearchTerm('')
    setStarFilter('all')
    setCurrentPage(1)
  }

  /* Logout */

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    toast.success('You have been logged out.')

    navigate('/login', { replace: true })
  }

  /* Table Content */

  const renderTableArea = () => {
    if (status === 'loading') {
      return <TableSkeleton />
    }

    if (status === 'error') {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <X className="h-8 w-8 text-red-500" />
          </div>

          <h3 className="text-lg font-bold text-[#25213A]">
            Unable to Load Ratings
          </h3>

          <p className="mt-2 max-w-sm text-sm text-[#25213A]/55">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7655D9] to-[#38BDF8] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7655D9]/25 transition hover:-translate-y-1"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )
    }

    if (ratings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7655D9]/10">
            <MessageSquare className="h-8 w-8 text-[#7655D9]" />
          </div>

          <h3 className="text-lg font-bold text-[#25213A]">
            No Ratings Yet
          </h3>

          <p className="mt-2 max-w-sm text-sm text-[#25213A]/55">
            Customers who rate your store will appear here.
          </p>
        </div>
      )
    }

    if (visibleRatings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7655D9]/10">
            <Search className="h-8 w-8 text-[#7655D9]" />
          </div>

          <h3 className="text-lg font-bold text-[#25213A]">
            No Matching Ratings
          </h3>

          <p className="mt-2 text-sm text-[#25213A]/55">
            Try changing your search or filter.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-xl border border-[#7655D9]/25 px-5 py-2.5 text-sm font-semibold text-[#7655D9] transition hover:bg-[#7655D9]/10"
          >
            Clear Filters
          </button>
        </div>
      )
    }

    return (
      <>
        <RatingsTable ratings={pagedRatings} />

        {pageCount > 1 && (
          <Pagination
            currentPage={safePage}
            pageCount={pageCount}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    )
  }

  /* Main UI */

  return (
    <div className="min-h-screen bg-[#F5F3FF] lg:flex">

      {/* Desktop Sidebar */}

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-gradient-to-b from-[#241044] to-[#160A2D] lg:flex">
        <SidebarContent
          ownerName={ownerName}
          ownerEmail={ownerEmail}
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
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-[#241044] to-[#160A2D] lg:hidden"
            >
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>

              <SidebarContent
                ownerName={ownerName}
                ownerEmail={ownerEmail}
                onNavigate={() => setIsDrawerOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}

      <div className="min-w-0 flex-1">

        {/* Header */}

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/70 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-xl p-2 text-[#25213A] transition hover:bg-[#7655D9]/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-base font-bold text-[#25213A] sm:text-lg">
                Users Who Rated
              </h1>
              <p className="text-xs text-[#25213A]/50">
                Manage your customer ratings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#25213A]">
                {ownerName || 'Store Owner'}
              </p>
              <p className="text-xs text-[#7655D9]">Store Owner</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7655D9] to-[#38BDF8] text-sm font-bold text-white shadow-lg shadow-[#7655D9]/20">
              {getInitials(ownerName)}
            </div>
          </div>
        </header>

        <main className="space-y-7 p-4 sm:p-7 lg:p-8">

          {/* Hero Section */}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#241044] via-[#432477] to-[#315B91] p-6 shadow-xl shadow-[#7655D9]/20 sm:p-8 lg:p-9"
          >
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#38BDF8]/20 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#7655D9]/40 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#F5F3FF] backdrop-blur-md">
                <Award className="h-4 w-4 text-[#FBBF24]" />
                Customer Feedback Center
              </div>

              <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                Your Customers,
                <br />
                Their Valuable Ratings
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#F5F3FF]/75 sm:text-base">
                Track customer satisfaction, explore ratings and understand
                how people experience your store.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <Users className="h-4 w-4 text-[#38BDF8]" />
                  Customer Insights
                </span>

                <span className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <Star className="h-4 w-4 text-[#FBBF24]" />
                  Rating Analytics
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 right-8 hidden h-52 w-52 items-center justify-center opacity-20 lg:flex">
              <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/40">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/40">
                  <Star className="h-16 w-16 fill-[#FBBF24] text-[#FBBF24]" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Summary Cards */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {status === 'success' ? (
              <>
                <SummaryCard
                  label="Total Ratings"
                  value={summary.total.toLocaleString()}
                  footnote="All customer ratings"
                  icon={MessageSquare}
                  color="bg-gradient-to-br from-[#7655D9] to-[#241044]"
                  index={0}
                />

                <SummaryCard
                  label="Average Rating"
                  value={summary.average === null ? '-' : summary.average.toFixed(1)}
                  footnote="Out of 5 stars"
                  icon={Star}
                  color="bg-gradient-to-br from-[#38BDF8] to-[#7655D9]"
                  index={1}
                />

                <SummaryCard
                  label="5 Star Ratings"
                  value={summary.fiveStar.toLocaleString()}
                  footnote="Excellent experiences"
                  icon={Award}
                  color="bg-gradient-to-br from-[#FBBF24] to-[#F59E0B]"
                  index={2}
                />

                <SummaryCard
                  label="Recent Ratings"
                  value={summary.recent.toLocaleString()}
                  footnote="In the last 7 days"
                  icon={CalendarDays}
                  color="bg-gradient-to-br from-[#241044] to-[#38BDF8]"
                  index={3}
                />
              </>
            ) : (
              [1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl bg-white p-5 shadow-lg"
                >
                  <div className="h-4 w-28 rounded bg-[#7655D9]/10" />
                  <div className="mt-4 h-8 w-16 rounded bg-[#7655D9]/10" />
                </div>
              ))
            )}
          </section>

          {/* Ratings Section */}

          <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-[#7655D9]/10">

            {/* Section Heading */}

            <div className="flex flex-col justify-between gap-3 border-b border-[#7655D9]/10 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7655D9]/10">
                    <Users className="h-5 w-5 text-[#7655D9]" />
                  </div>

                  <h3 className="text-lg font-bold text-[#25213A]">
                    Customer Ratings
                  </h3>
                </div>

                <p className="mt-2 text-xs text-[#25213A]/50">
                  View and manage ratings submitted by your customers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#7655D9]/20 px-4 py-2.5 text-xs font-semibold text-[#7655D9] transition hover:bg-[#7655D9]/10 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            </div>

            {/* Filters */}

            <div className="flex flex-col gap-3 border-b border-[#7655D9]/10 bg-[#F5F3FF]/40 p-4 lg:flex-row lg:items-center lg:justify-between sm:p-5">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7655D9]/60" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    resetPage()
                  }}
                  placeholder="Search customer name or email..."
                  className="w-full rounded-xl border border-[#7655D9]/15 bg-white py-3 pl-10 pr-4 text-sm text-[#25213A] outline-none transition focus:border-[#7655D9] focus:ring-4 focus:ring-[#7655D9]/10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Star className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7655D9]" />

                  <select
                    value={starFilter}
                    onChange={(event) => {
                      const value = event.target.value
                      setStarFilter(value === 'all' ? 'all' : Number(value))
                      resetPage()
                    }}
                    disabled={status !== 'success'}
                    className="w-full appearance-none rounded-xl border border-[#7655D9]/15 bg-white py-3 pl-10 pr-9 text-sm font-medium text-[#25213A] outline-none transition focus:border-[#7655D9] sm:w-40"
                  >
                    {STAR_FILTER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option === 'all'
                          ? 'All Ratings'
                          : `${option} ${option === 1 ? 'Star' : 'Stars'}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <ListFilter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7655D9]" />

                  <select
                    value={sortKey}
                    onChange={(event) => {
                      setSortKey(event.target.value)
                      resetPage()
                    }}
                    disabled={status !== 'success'}
                    className="w-full appearance-none rounded-xl border border-[#7655D9]/15 bg-white py-3 pl-10 pr-9 text-sm font-medium text-[#25213A] outline-none transition focus:border-[#7655D9] sm:w-40"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#7655D9] transition hover:bg-[#7655D9]/10"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Result Count */}

            {status === 'success' && ratings.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-xs font-medium text-[#25213A]/55">
                  Showing{' '}
                  <span className="font-bold text-[#25213A]">
                    {visibleRatings.length}
                  </span>{' '}
                  of {ratings.length} ratings
                </p>

                <span className="rounded-full bg-[#38BDF8]/10 px-3 py-1 text-[10px] font-bold text-[#315B91]">
                  LIVE DATA
                </span>
              </div>
            )}

            {renderTableArea()}
          </section>

          {/* Bottom Note */}

          <div className="flex items-center gap-3 rounded-2xl border border-[#7655D9]/10 bg-white/70 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#38BDF8]/10">
              <ShieldCheck className="h-5 w-5 text-[#315B91]" />
            </div>

            <div>
              <p className="text-xs font-bold text-[#25213A]">
                Customer Feedback is Important
              </p>
              <p className="mt-1 text-[11px] text-[#25213A]/50">
                Use customer ratings to understand your store's performance and improve service quality.
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}