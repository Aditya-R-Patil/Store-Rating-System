
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Store, LayoutDashboard, Users, KeyRound, LogOut,
  Menu, X, RefreshCw, Mail, Phone, MapPin, Clock,
  Globe, Map, Tag, FileText, Image as ImageIcon,
  ExternalLink, Star, Sparkles, ArrowLeft, ChevronRight
} from 'lucide-react'
import api from '../../services/api.js'

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
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
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

function Sidebar({ user, onNavigate, onLogout }) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7655D9] to-[#38BDF8]">
          <Store className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white">Store Rating</h2>
          <p className="text-xs text-white/50">Management System</p>
        </div>
      </div>

      <div className="mx-4 my-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7655D9] to-[#38BDF8] text-sm font-bold text-white">
          {getInitials(user?.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {user?.name || 'Store Owner'}
          </p>
          <p className="truncate text-xs text-white/50">{user?.email || ''}</p>
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
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/10 text-[#38BDF8]'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#38BDF8]" />
                )}
                <Icon className="h-5 w-5" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/65 transition hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  )
}

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={16}
          className={
            rating >= star
              ? 'fill-[#FBBF24] text-[#FBBF24]'
              : 'text-gray-300'
          }
        />
      ))}
    </div>
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
              className="mt-2 inline-flex items-center gap-2 break-all text-sm font-semibold text-[#7655D9] hover:text-[#241044]"
            >
              {value}
              <ExternalLink size={14} />
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

function StoreCard({ store, onClick, index }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getImageUrl(store.image_url || store.imageUrl)
  const averageRating = Number(store.averageRating || 0)

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-3xl border border-[#7655D9]/10 bg-white text-left shadow-lg shadow-[#7655D9]/5 transition hover:shadow-xl hover:shadow-[#7655D9]/15"
    >
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#241044] to-[#7655D9]">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={store.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-16 w-16 text-white/70" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#160927]/90 via-transparent to-transparent" />

        {store.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {store.category}
          </span>
        )}

        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="truncate text-xl font-extrabold text-white">
            {store.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-white/75">
            <MapPin size={13} />
            <span className="truncate">{store.address || 'Address not provided'}</span>
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#25213A]/50">Average Rating</p>
            <p className="mt-1 text-2xl font-extrabold text-[#241044]">
              {averageRating.toFixed(1)}
              <span className="text-sm font-medium text-[#25213A]/40"> / 5</span>
            </p>
          </div>

          <RatingStars rating={averageRating} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#7655D9]/10 pt-4">
          <p className="text-xs font-medium text-[#25213A]/55">
            {Number(store.totalRatings || 0)} Customer Ratings
          </p>
          <span className="flex items-center gap-1 text-sm font-bold text-[#7655D9] transition group-hover:text-[#38BDF8]">
            View Details <ChevronRight size={17} />
          </span>
        </div>
      </div>
    </motion.button>
  )
}

function StoreDetails({ store, onBack }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getImageUrl(store.image_url || store.imageUrl)
  const averageRating = Number(store.averageRating || 0)
  const totalRatings = Number(store.totalRatings || 0)

  const details = [
    { label: 'Category', value: store.category, icon: Tag },
    { label: 'Email Address', value: store.email, icon: Mail },
    { label: 'Contact Number', value: store.contact_number || store.contactNumber, icon: Phone },
    { label: 'Store Address', value: store.address, icon: MapPin },
    { label: 'Opening Hours', value: store.opening_hours || store.openingHours, icon: Clock },
    {
      label: 'Website',
      value: store.website_url || store.websiteUrl,
      icon: Globe,
      link: store.website_url || store.websiteUrl
    },
    {
      label: 'Google Maps',
      value: store.location_url || store.mapsUrl,
      icon: Map,
      link: store.location_url || store.mapsUrl
    }
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
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-[#7655D9]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#241044] transition hover:bg-[#F5F3FF]"
      >
        <ArrowLeft size={17} /> Back to My Stores
      </button>

      <section className="overflow-hidden rounded-[28px] border border-white bg-white shadow-xl shadow-[#7655D9]/10">
        <div className="relative h-64 overflow-hidden sm:h-96">
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={store.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#241044] to-[#7655D9]">
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
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              {store.name}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
              <MapPin size={16} /> {store.address || 'Address not provided'}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F5F3FF] p-6">
              <p className="text-xs font-semibold text-[#25213A]/55">Average Rating</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold text-[#241044]">
                  {averageRating.toFixed(1)} / 5
                </span>
                <RatingStars rating={averageRating} />
              </div>
            </div>

            <div className="rounded-2xl bg-[#F5F3FF] p-6">
              <p className="text-xs font-semibold text-[#25213A]/55">Total Customer Ratings</p>
              <p className="mt-2 text-3xl font-extrabold text-[#241044]">{totalRatings}</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[2px] text-[#7655D9]">
              Store Information
            </p>
            <h3 className="mt-1 text-xl font-bold text-[#241044]">Complete Business Details</h3>
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
        </div>
      </section>
    </motion.div>
  )
}

function LoadingState() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map(item => (
        <div key={item} className="animate-pulse overflow-hidden rounded-3xl bg-white">
          <div className="h-52 bg-[#7655D9]/10" />
          <div className="space-y-4 p-5">
            <div className="h-5 w-2/3 rounded bg-[#F5F3FF]" />
            <div className="h-4 w-1/2 rounded bg-[#F5F3FF]" />
            <div className="h-10 rounded bg-[#F5F3FF]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MyStore() {
  const navigate = useNavigate()
  const [user] = useState(readStoredUser)
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    setStatus('loading')
    setErrorMessage('')

    api.get('/owner/store', { signal: controller.signal })
      .then(({ data }) => {
        setStores(Array.isArray(data?.stores) ? data.stores : [])
        setStatus('success')
      })
      .catch(error => {
        if (error.code === 'ERR_CANCELED') return

        setErrorMessage(
          error.response?.data?.message || 'Unable to load your stores. Please try again.'
        )
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadKey])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully.')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] lg:flex">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-gradient-to-b from-[#241044] to-[#1A0C33] lg:flex">
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
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-[#241044] to-[#1A0C33] lg:hidden"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-white"
                aria-label="Close menu"
              >
                <X size={20} />
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
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#7655D9]/10 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-xl p-2 text-[#25213A] hover:bg-[#7655D9]/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-[#241044]">My Stores</h1>
              <p className="text-xs text-[#25213A]/50">
                {selectedStore ? 'Store details' : 'Select a store to view its complete information'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setReloadKey(key => key + 1)}
              disabled={status === 'loading'}
              className="flex items-center gap-2 rounded-xl border border-[#7655D9]/20 bg-white px-3 py-2.5 text-sm font-semibold text-[#25213A] hover:bg-[#F5F3FF] disabled:opacity-50"
            >
              <RefreshCw size={16} className={`text-[#7655D9] ${status === 'loading' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#25213A]">{user?.name || 'Store Owner'}</p>
              <p className="text-xs text-[#7655D9]">Store Owner</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7655D9] to-[#38BDF8] text-sm font-bold text-white">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-7 p-4 sm:p-8">
          {!selectedStore && (
            <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#241044] via-[#432477] to-[#315B91] p-7 text-white shadow-xl shadow-[#7655D9]/15 sm:p-9">
              <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#38BDF8]/20 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  <Sparkles size={14} className="text-[#38BDF8]" />
                  OWNER WORKSPACE
                </span>
                <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                  Your Business Portfolio
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                  All your assigned stores in one place. Select any store to explore its complete business information and ratings.
                </p>
                <p className="mt-5 text-sm font-semibold text-[#38BDF8]">
                  {stores.length} {stores.length === 1 ? 'Store' : 'Stores'} assigned to your account
                </p>
              </div>
            </section>
          )}

          {status === 'loading' && <LoadingState />}

          {status === 'error' && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
              <X className="mx-auto h-10 w-10 text-red-500" />
              <h3 className="mt-4 text-xl font-bold text-[#241044]">Could Not Load Stores</h3>
              <p className="mt-2 text-sm text-[#25213A]/60">{errorMessage}</p>
              <button
                onClick={() => setReloadKey(key => key + 1)}
                className="mt-5 rounded-xl bg-gradient-to-r from-[#7655D9] to-[#38BDF8] px-5 py-3 text-sm font-bold text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {status === 'success' && stores.length === 0 && (
            <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-lg">
              <Store className="mx-auto h-12 w-12 text-[#7655D9]" />
              <h3 className="mt-4 text-xl font-bold text-[#241044]">No Stores Assigned</h3>
              <p className="mt-2 text-sm text-[#25213A]/55">
                No stores are currently linked to your account. Please contact your administrator.
              </p>
            </div>
          )}

          {status === 'success' && stores.length > 0 && (
            <AnimatePresence mode="wait">
              {selectedStore ? (
                <StoreDetails
                  key={selectedStore.id}
                  store={selectedStore}
                  onBack={() => setSelectedStore(null)}
                />
              ) : (
                <motion.div
                  key="store-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {stores.map((store, index) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      index={index}
                      onClick={() => setSelectedStore(store)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <footer className="border-t border-[#7655D9]/10 pt-6 text-center text-xs text-[#25213A]/45">
            Store Rating Management System · My Stores
          </footer>
        </main>
      </div>
    </div>
  )
}
