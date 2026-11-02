
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  AlertTriangle, Image as ImageIcon, KeyRound, LayoutDashboard,
  ListFilter, LogOut, MapPin, Menu, MessageSquare, RefreshCw,
  Search, ShieldCheck, Sparkles, Star, Store, Tag, X,
  ArrowLeft, Mail, Phone, Clock, Globe, Map, FileText,
  ExternalLink, ChevronRight
} from 'lucide-react'
import api from '../../services/api.js'

const COLORS = {
  midnight: '#241044',
  violet: '#7655D9',
  electric: '#38BDF8',
  lavender: '#F5F3FF',
  charcoal: '#25213A',
}

const ALL_CATEGORIES = 'all'

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Store Name A-Z' },
  { value: 'name-desc', label: 'Store Name Z-A' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'rating-asc', label: 'Rating: Low to High' },
]

const SORT_COMPARATORS = {
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
  'rating-desc': (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
  'rating-asc': (a, b) => (a.averageRating ?? 0) - (b.averageRating ?? 0),
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

function normalizeStore(raw) {
  return {
    id: raw.id,
    name: firstValue(raw, 'name', 'store_name', 'storeName') ?? '',
    email: firstValue(raw, 'email') ?? '',
    address: firstValue(raw, 'address') ?? '',
    category: firstValue(raw, 'category') ?? '',
    description: firstValue(raw, 'description') ?? '',
    imageUrl: firstValue(raw, 'image_url', 'imageUrl') ?? '',
    contactNumber: firstValue(raw, 'contact_number', 'contactNumber') ?? '',
    openingHours: firstValue(raw, 'opening_hours', 'openingHours') ?? '',
    websiteUrl: firstValue(raw, 'website_url', 'websiteUrl') ?? '',
    mapsUrl: firstValue(raw, 'location_url', 'mapsUrl', 'locationUrl') ?? '',
    averageRating: toNumberOrNull(firstValue(raw, 'average_rating', 'averageRating')),
    totalRatings: toNumberOrNull(firstValue(raw, 'total_ratings', 'totalRatings')) ?? 0,
    userRating: toNumberOrNull(firstValue(raw, 'user_rating', 'userRating', 'my_rating', 'myRating')),
  }
}

async function fetchStores(signal) {
  const { data } = await api.get('/user/stores', { signal })
  const list = Array.isArray(data) ? data : data?.stores

  if (!Array.isArray(list)) {
    throw new Error('Unexpected response from the server.')
  }

  return list.map(normalizeStore)
}

function getErrorMessage(error, fallback) {
  if (error.response?.data?.message) return error.response.data.message

  if (error.request && !error.response) {
    return 'Cannot reach the server. Please make sure the backend is running.'
  }

  return error.message || fallback
}

function getImageUrl(image) {
  if (!image) return ''
  if (image.startsWith('http')) return image
  if (image.startsWith('/uploads/')) return `http://localhost:5000${image}`
  return `http://localhost:5000/uploads/${image}`
}

function getSafeUrl(url) {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function SidebarContent({ userName, userEmail, onNavigate, onLogout }) {
  const initials = (userName || 'U')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const navItems = [
    { label: 'Dashboard', to: '/user/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Ratings', to: '/user/ratings', icon: Star },
    { label: 'Change Password', to: '/user/change-password', icon: KeyRound },
  ]

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
          <p className="text-xs text-purple-200">User Portal</p>
        </div>
      </div>

      <div className="mx-5 mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
          <ShieldCheck className="h-4 w-4" />
          NORMAL USER
        </div>
        <p className="mt-2 text-sm text-white/70">
          Discover stores and share your experience.
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[2px] text-purple-300/60">
          Main Menu
        </p>

        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className="block rounded-xl px-4 py-3 transition-all"
            style={({ isActive }) => ({
              background: isActive ? 'rgba(118,85,217,0.25)' : 'transparent',
              color: isActive ? COLORS.electric : '#D7CDED',
              borderLeft: isActive ? `3px solid ${COLORS.electric}` : '3px solid transparent',
            })}
          >
            <span className="flex items-center gap-3 text-sm font-semibold">
              <Icon className="h-5 w-5" />
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7655D9, #38BDF8)' }}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{userName || 'User'}</p>
            <p className="truncate text-xs text-purple-200">{userEmail || 'Signed in'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  )
}

function StarDisplay({ value, size = 18 }) {
  if (value === null) return null

  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(value)
              ? 'fill-[#FBBF24] text-[#FBBF24]'
              : 'fill-transparent text-gray-300'
          }
        />
      ))}
    </span>
  )
}

// Stable rating stars: no scale or position animation
function StarInput({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value

  return (
    <div
      className="flex flex-wrap items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(0)}
          disabled={disabled}
          aria-label={`Rate ${star} stars`}
          aria-pressed={value === star}
          className="rounded-md p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7655D9] disabled:cursor-not-allowed"
        >
          <Star
            size={28}
            className={
              star <= shown
                ? 'fill-[#FBBF24] text-[#FBBF24]'
                : 'fill-transparent text-gray-300'
            }
          />
        </button>
      ))}

      <span className="ml-2 min-w-[4.5rem] text-sm font-semibold text-[#25213A]">
        {shown ? `${shown} / 5` : 'Tap to rate'}
      </span>
    </div>
  )
}

function RatingPanel({ store, onRatingSaved }) {
  const [draft, setDraft] = useState(store.userRating ?? 0)
  const [isSaving, setIsSaving] = useState(false)

  const hasRating = store.userRating !== null
  const canSubmit = draft >= 1 && draft !== (store.userRating ?? 0) && !isSaving

  const handleSubmit = async () => {
    setIsSaving(true)

    try {
      await api.post('/ratings', {
        store_id: store.id,
        rating: draft,
      })

      toast.success(
        hasRating
          ? `Your rating for ${store.name} was updated.`
          : `Thanks for rating ${store.name}!`
      )

      await onRatingSaved()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save your rating.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-[#89829C]">
          Your Rating
        </p>

        {hasRating && (
          <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700">
            RATED
          </span>
        )}
      </div>

      <StarInput value={draft} onChange={setDraft} disabled={isSaving} />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          background: canSubmit
            ? 'linear-gradient(135deg, #7655D9, #38BDF8)'
            : '#E8E5EF',
          color: canSubmit ? '#FFFFFF' : '#89829C',
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : hasRating ? (
          'Update Rating'
        ) : (
          'Submit Rating'
        )}
      </button>
    </div>
  )
}

function StoreCard({ store, index, onSelect, onRatingSaved }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getImageUrl(store.imageUrl)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.06 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-[#241044]/5 transition hover:shadow-2xl hover:shadow-[#7655D9]/15"
    >
      <button
        type="button"
        onClick={onSelect}
        className="text-left"
      >
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#241044] to-[#7655D9]">
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={store.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-14 w-14 text-white/70" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#241044]/70 via-transparent to-transparent" />

          {store.category && (
            <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#241044] shadow-lg">
              {store.category}
            </span>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="truncate text-xl font-extrabold text-white">
              {store.name || 'Unnamed Store'}
            </h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/80">
              <MapPin size={15} />
              <span className="truncate">
                {store.address || 'Address not provided'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 pb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#89829C]">
              Overall Rating
            </p>
            <div className="mt-2 flex items-center gap-2">
              {store.averageRating === null ? (
                <span className="text-sm text-[#89829C]">No ratings yet</span>
              ) : (
                <>
                  <StarDisplay value={store.averageRating} />
                  <span className="font-extrabold text-[#25213A]">
                    {store.averageRating.toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#89829C]">
              Total Ratings
            </p>
            <p className="mt-2 flex items-center justify-end gap-1 font-bold text-[#25213A]">
              <MessageSquare size={15} className="text-[#7655D9]" />
              {store.totalRatings}
            </p>
          </div>
        </div>

        <div className="px-5 pb-4 pt-2">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#7655D9] group-hover:text-[#38BDF8]">
            View Complete Details <ChevronRight size={17} />
          </span>
        </div>
      </button>

      <div className="mt-auto border-t border-purple-100 p-5">
        <RatingPanel store={store} onRatingSaved={onRatingSaved} />
      </div>
    </motion.article>
  )
}

function InfoItem({ icon: Icon, label, value, link }) {
  return (
    <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-[#7655D9]/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7655D9]/10">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F3FF]">
        <Icon className="h-5 w-5 text-[#7655D9]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#25213A]/45">
          {label}
        </p>

        {value ? (
          link ? (
            <a
              href={getSafeUrl(link)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={event => event.stopPropagation()}
              className="mt-2 inline-flex items-center gap-2 break-all text-sm font-semibold text-[#7655D9] hover:text-[#241044]"
            >
              {value} <ExternalLink size={14} />
            </a>
          ) : (
            <p className="mt-2 break-words text-sm font-semibold leading-6 text-[#25213A]">
              {value}
            </p>
          )
        ) : (
          <p className="mt-2 text-sm text-[#25213A]/35">Not provided</p>
        )}
      </div>
    </div>
  )
}

function StoreDetails({ store, onBack, onRatingSaved }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getImageUrl(store.imageUrl)

  const details = [
    { label: 'Category', value: store.category, icon: Tag },
    { label: 'Email Address', value: store.email, icon: Mail },
    { label: 'Contact Number', value: store.contactNumber, icon: Phone },
    { label: 'Store Address', value: store.address, icon: MapPin },
    { label: 'Opening Hours', value: store.openingHours, icon: Clock },
    { label: 'Website', value: store.websiteUrl, icon: Globe, link: store.websiteUrl },
    { label: 'Google Maps', value: store.mapsUrl, icon: Map, link: store.mapsUrl },
  ]

  return (
    <motion.div
      key={store.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-[#7655D9]/20 bg-white px-4 py-3 text-sm font-bold text-[#241044] transition hover:bg-[#F5F3FF]"
      >
        <ArrowLeft size={18} /> Back to Stores
      </button>

      <section className="overflow-hidden rounded-[28px] border border-white bg-white shadow-xl shadow-[#7655D9]/10">
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#241044] to-[#7655D9] sm:h-96">
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={store.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-20 w-20 text-white/70" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#160927]/95 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-9">
            {store.category && (
              <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                {store.category}
              </span>
            )}

            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              {store.name}
            </h2>

            <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
              <MapPin size={16} />
              {store.address || 'Address not provided'}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F5F3FF] p-6">
              <p className="text-xs font-semibold text-[#25213A]/55">
                Overall Rating
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold text-[#241044]">
                  {store.averageRating === null ? 'N/A' : store.averageRating.toFixed(1)}
                  <span className="text-sm"> / 5</span>
                </span>
                <StarDisplay value={store.averageRating} />
              </div>
            </div>

            <div className="rounded-2xl bg-[#F5F3FF] p-6">
              <p className="text-xs font-semibold text-[#25213A]/55">
                Total Customer Ratings
              </p>
              <p className="mt-3 text-3xl font-extrabold text-[#241044]">
                {store.totalRatings}
              </p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[2px] text-[#7655D9]">
              Store Information
            </p>
            <h3 className="mt-1 text-xl font-bold text-[#241044]">
              Complete Business Details
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {details.map(item => (
              <InfoItem key={item.label} {...item} />
            ))}

            <div className="rounded-2xl border border-[#7655D9]/10 bg-white p-5 sm:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F3FF]">
                  <FileText className="h-5 w-5 text-[#7655D9]" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#25213A]/45">
                    About the Store
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#25213A]">
                    {store.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[#7655D9]/10 bg-[#F5F3FF] p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7655D9]">
              Share Your Experience
            </p>
            <h3 className="mb-4 mt-1 text-xl font-bold text-[#241044]">
              Rate This Store
            </h3>
            <RatingPanel store={store} onRatingSaved={onRatingSaved} />
          </div>
        </div>
      </section>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl bg-white shadow-xl">
      <div className="h-48 bg-gray-200" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-16 rounded-2xl bg-gray-100" />
        <div className="h-10 rounded-xl bg-purple-100" />
      </div>
    </div>
  )
}

function StateMessage({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center gap-3 rounded-3xl border border-white bg-white px-6 py-16 text-center shadow-xl"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
        <Icon className="h-8 w-8 text-[#7655D9]" />
      </div>

      <h3 className="text-lg font-extrabold text-[#25213A]">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-[#89829C]">{description}</p>
      {action}
    </motion.div>
  )
}

export default function UserDashboard() {
  const navigate = useNavigate()

  const [user] = useState(readStoredUser)
  const [stores, setStores] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES)
  const [sortKey, setSortKey] = useState('name-asc')

  const userName = user?.name || 'User'
  const userEmail = user?.email || ''
  const firstName = userName.split(' ')[0]

  const initials = userName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    fetchStores(controller.signal)
      .then(list => {
        setStores(list)
        setStatus('success')
        setErrorMessage('')
      })
      .catch(error => {
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return

        setErrorMessage(
          getErrorMessage(error, 'Something went wrong while loading stores.')
        )
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadKey])

  const refreshStores = useCallback(async () => {
    try {
      const list = await fetchStores()
      setStores(list)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not refresh the store list.'))
    }
  }, [])

  const categories = useMemo(
    () => [...new Set(stores.map(store => store.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [stores]
  )

  const visibleStores = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const filtered = stores.filter(store => {
      if (categoryFilter !== ALL_CATEGORIES && store.category !== categoryFilter) {
        return false
      }

      if (!query) return true

      return (
        store.name.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query)
      )
    })

    return [...filtered].sort(SORT_COMPARATORS[sortKey])
  }, [stores, searchTerm, categoryFilter, sortKey])

  const selectedStore = stores.find(store => store.id === selectedStoreId) || null

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter(ALL_CATEGORIES)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }

  const renderGrid = () => {
    if (status === 'loading') {
      return [0, 1, 2, 3, 4, 5].map(item => (
        <SkeletonCard key={item} />
      ))
    }

    if (status === 'error') {
      return (
        <StateMessage
          icon={AlertTriangle}
          title="Could not load stores"
          description={errorMessage}
          action={
            <button
              type="button"
              onClick={() => setReloadKey(key => key + 1)}
              className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
              style={{ background: COLORS.violet }}
            >
              <RefreshCw size={16} /> Try Again
            </button>
          }
        />
      )
    }

    if (stores.length === 0) {
      return (
        <StateMessage
          icon={Store}
          title="No stores available yet"
          description="Stores added to the platform will appear here so you can rate them."
        />
      )
    }

    if (visibleStores.length === 0) {
      return (
        <StateMessage
          icon={Search}
          title="No stores match your search"
          description="Try a different name, address or category."
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 rounded-xl border border-purple-200 bg-white px-5 py-3 text-sm font-bold text-[#7655D9]"
            >
              Clear Filters
            </button>
          }
        />
      )
    }

    return (
      <AnimatePresence mode="popLayout">
        {visibleStores.map((store, index) => (
          <StoreCard
            key={store.id}
            store={store}
            index={index}
            onSelect={() => setSelectedStoreId(store.id)}
            onRatingSaved={refreshStores}
          />
        ))}
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen lg:flex" style={{ background: COLORS.lavender }}>
      <aside
        className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col lg:flex"
        style={{ background: 'linear-gradient(180deg, #241044 0%, #1A0C33 100%)' }}
      >
        <SidebarContent
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
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
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col lg:hidden"
              style={{ background: 'linear-gradient(180deg, #241044, #1A0C33)' }}
            >
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-white"
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/70 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-xl p-2 hover:bg-purple-100 lg:hidden"
            >
              <Menu size={24} style={{ color: COLORS.midnight }} />
            </button>

            <div>
              <p className="text-base font-bold sm:text-lg" style={{ color: COLORS.charcoal }}>
                Welcome back, {firstName}!
              </p>
              <p className="text-xs sm:text-sm text-[#89829C]">
                {selectedStore
                  ? 'Explore complete store information.'
                  : 'Discover stores and share your experience.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold" style={{ color: COLORS.charcoal }}>
                {userName}
              </p>
              <p className="text-xs font-semibold" style={{ color: COLORS.violet }}>
                Normal User
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
          {!selectedStore && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mb-8 overflow-hidden rounded-3xl p-6 shadow-xl sm:p-8"
                style={{
                  background: 'linear-gradient(115deg, #241044 0%, #432477 55%, #315B91 100%)',
                }}
              >
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />

                <div className="relative z-10 max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                    <Sparkles size={16} /> USER DASHBOARD
                  </div>

                  <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                    Discover & Rate Stores
                  </h1>

                  <p className="mt-3 text-sm leading-relaxed text-purple-100 sm:text-base">
                    Explore stores, check customer ratings and share your experience.
                  </p>

                  <button
                    type="button"
                    onClick={() => setReloadKey(key => key + 1)}
                    disabled={status === 'loading'}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
                    style={{ background: COLORS.violet }}
                  >
                    <RefreshCw className={status === 'loading' ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                    {status === 'loading' ? 'Loading...' : 'Refresh Stores'}
                  </button>
                </div>
              </motion.section>

              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold" style={{ color: COLORS.charcoal }}>
                    Explore Stores
                  </h2>
                  <p className="mt-1 text-sm text-[#89829C]">
                    Select a store card to view complete details.
                  </p>
                </div>
                <Store size={24} style={{ color: COLORS.violet }} />
              </div>

              <section className="mb-7 rounded-3xl border border-white bg-white p-4 shadow-xl shadow-[#241044]/5 sm:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="relative w-full xl:max-w-sm xl:flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89829C]" />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                      placeholder="Search by store name or address"
                      className="w-full rounded-xl border border-purple-100 bg-[#FDFCFF] py-3 pl-10 pr-4 text-sm text-[#25213A] outline-none focus:border-[#7655D9] focus:ring-4 focus:ring-purple-100"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative">
                      <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89829C]" />
                      <select
                        value={categoryFilter}
                        onChange={event => setCategoryFilter(event.target.value)}
                        disabled={categories.length === 0}
                        className="w-full rounded-xl border border-purple-100 bg-[#FDFCFF] py-3 pl-10 pr-4 text-sm text-[#25213A] outline-none focus:border-[#7655D9]"
                      >
                        <option value={ALL_CATEGORIES}>All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <ListFilter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89829C]" />
                      <select
                        value={sortKey}
                        onChange={event => setSortKey(event.target.value)}
                        className="w-full rounded-xl border border-purple-100 bg-[#FDFCFF] py-3 pl-10 pr-4 text-sm text-[#25213A] outline-none focus:border-[#7655D9]"
                      >
                        {SORT_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(searchTerm.trim() || categoryFilter !== ALL_CATEGORIES) && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl px-4 py-3 text-sm font-bold text-[#7655D9] hover:bg-purple-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {status === 'success' && (
                  <div className="mt-4 flex items-center justify-between border-t border-purple-50 pt-3">
                    <p className="text-xs font-semibold text-[#89829C]">
                      Showing {visibleStores.length} of {stores.length} stores
                    </p>
                    <span className="text-xs font-semibold text-[#7655D9]">
                      {categories.length} Categories
                    </span>
                  </div>
                )}
              </section>
            </>
          )}

          <AnimatePresence mode="wait">
            {selectedStore ? (
              <StoreDetails
                key={selectedStore.id}
                store={selectedStore}
                onBack={() => setSelectedStoreId(null)}
                onRatingSaved={refreshStores}
              />
            ) : (
              <motion.div
                key="store-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {renderGrid()}
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-10 py-6 text-center text-xs text-[#9690A8]">
            Store Rating System · User Dashboard
          </footer>
        </main>
      </div>
    </div>
  )
}
