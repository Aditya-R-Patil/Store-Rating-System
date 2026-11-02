
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  ArrowDownUp, Clock, ExternalLink, Eye, Globe, Layers,
  LayoutDashboard, LogOut, Mail, Map as MapIcon, MapPin,
  Menu, MessageSquare, Phone, Plus, RefreshCw, Search,
  Shield, Star, Store, Tag, TriangleAlert, UserPlus,
  Users, X, Image as ImageIcon, UserRound, Sparkles
} from 'lucide-react'
import api from '../../services/api.js'

const C = {
  midnight: '#241044',
  violet: '#7655D9',
  blue: '#38BDF8',
  lavender: '#F5F3FF',
  charcoal: '#25213A',
  white: '#FFFFFF',
  muted: '#77718A',
  border: '#E9E2F7',
  yellow: '#FBBF24'
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Manage Users', to: '/admin/users', icon: Users },
  { label: 'Manage Stores', to: '/admin/stores', icon: Store },
  { label: 'Add User', to: '/admin/users/new', icon: UserPlus },
  { label: 'Add Store', to: '/admin/stores/new', icon: Plus }
]

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Store Name A-Z' },
  { value: 'name-desc', label: 'Store Name Z-A' },
  { value: 'email-asc', label: 'Email A-Z' },
  { value: 'email-desc', label: 'Email Z-A' },
  { value: 'rating-desc', label: 'Highest Rating' },
  { value: 'rating-asc', label: 'Lowest Rating' },
  { value: 'rated-desc', label: 'Most Rated' },
  { value: 'rated-asc', label: 'Least Rated' }
]

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
    phone: firstValue(raw, 'contact_number', 'contactNumber', 'phone') ?? '',
    openingHours: firstValue(raw, 'opening_hours', 'openingHours') ?? '',
    website: firstValue(raw, 'website_url', 'websiteUrl', 'website') ?? '',
    mapsUrl: firstValue(raw, 'location_url', 'google_maps_url', 'googleMapsUrl', 'maps_url') ?? '',
    imageUrl: firstValue(raw, 'image_url', 'imageUrl') ?? '',
    averageRating: toNumberOrNull(firstValue(raw, 'averageRating', 'average_rating')),
    totalRatings: toNumberOrNull(firstValue(raw, 'totalRatings', 'total_ratings')) ?? 0,
    ownerName: firstValue(raw, 'owner_name', 'ownerName') ?? raw.owner?.name ?? ''
  }
}

function toSafeUrl(value) {
  if (!value) return null
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(candidate)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message
  if (error.request && !error.response) {
    return 'Cannot reach the server. Please make sure the backend is running.'
  }
  return error.message || 'Unable to load stores.'
}

function SidebarContent({ onNavigate, onLogout }) {
  return (
    <>
      <div style={{ padding: '28px 22px 30px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 43, height: 43, borderRadius: 14,
          display: 'grid', placeItems: 'center',
          background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`,
          boxShadow: '0 7px 22px #7655D966'
        }}>
          <Store size={22} color="white" />
        </div>
        <div>
          <p style={{ color: 'white', fontSize: 16, fontWeight: 800, margin: 0 }}>Store Rating</p>
          <p style={{ color: '#BDB0D8', fontSize: 11, margin: '4px 0 0' }}>ADMINISTRATION</p>
        </div>
      </div>

      <p style={{
        color: '#9E8BBE', fontSize: 10, fontWeight: 800,
        letterSpacing: 1.5, padding: '0 24px', marginBottom: 12
      }}>
        MAIN MENU
      </p>

      <nav style={{ padding: '0 12px', flex: 1 }}>
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              padding: '13px 15px',
              marginBottom: 6,
              borderRadius: 12,
              color: isActive ? C.white : '#C4B9D9',
              background: isActive
                ? 'linear-gradient(100deg, #7655D955, #38BDF822)'
                : 'transparent',
              border: isActive ? '1px solid #7655D977' : '1px solid transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              transition: 'all .2s'
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={19} color={isActive ? C.blue : '#BDB0D8'} />
                {label}
                {isActive && (
                  <span style={{
                    marginLeft: 'auto', width: 6, height: 6,
                    borderRadius: 10, background: C.blue
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 13, borderTop: '1px solid #FFFFFF18' }}>
        <button
          type="button"
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 12, padding: 13, border: 0, borderRadius: 12,
            background: '#DC52521A', color: '#FFAAAA',
            fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  )
}


function StoreImage({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false)

  const imageSrc = src
    ? src.startsWith('/uploads/')
      ? `http://localhost:5000${src}`
      : src
    : ''

  if (!imageSrc || failed) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EEE8FF, #DDF5FF)',
          color: C.violet
        }}
      >
        <ImageIcon size={25} />
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={name ? `${name} store` : 'Store'}
      onError={() => setFailed(true)}
      className={className}
      style={{
        objectFit: 'cover',
        display: 'block'
      }}
    />
  )
}



function StarRating({ value, size = 15 }) {
  if (value === null || value === undefined) {
    return (
      <span style={{ fontSize: 12, color: C.muted }}>
        No ratings yet
      </span>
    )
  }

  const rating = Math.min(Math.max(Number(value) || 0, 0), 5)

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7
    }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((item) => {
          const fillPercent = Math.min(
            Math.max(rating - (item - 1), 0),
            1
          ) * 100

          return (
            <span
              key={item}
              style={{
                position: 'relative',
                display: 'inline-block',
                width: size,
                height: size
              }}
            >
              <Star
                size={size}
                color="#D9D5E1"
                fill="none"
                style={{ position: 'absolute', left: 0, top: 0 }}
              />

              <span style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${fillPercent}%`,
                height: size,
                overflow: 'hidden'
              }}>
                <Star
                  size={size}
                  color={C.yellow}
                  fill={C.yellow}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    minWidth: size,
                    maxWidth: 'none'
                  }}
                />
              </span>
            </span>
          )
        })}
      </span>

      <span style={{
        fontSize: 12,
        fontWeight: 800,
        color: C.charcoal
      }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}


function StatCard({ label, value, icon: Icon, index, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -5 }}
      style={{
        position: 'relative', overflow: 'hidden',
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 19, padding: 21,
        boxShadow: '0 8px 28px #2410440B'
      }}
    >
      <div style={{
        position: 'absolute', width: 110, height: 110,
        borderRadius: '50%', right: -40, top: -45,
        background: gradient, opacity: 0.09, filter: 'blur(5px)'
      }} />
      <div style={{
        position: 'relative', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: 10
      }}>
        <div>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, margin: 0 }}>{label}</p>
          <h2 style={{
            color: C.charcoal, fontSize: 30,
            fontWeight: 800, margin: '10px 0 0'
          }}>{value}</h2>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 15,
          display: 'grid', placeItems: 'center',
          background: gradient, boxShadow: '0 7px 18px #7655D933'
        }}>
          <Icon size={22} color="white" />
        </div>
      </div>
    </motion.div>
  )
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: 14, borderRadius: 13, background: C.lavender,
      minWidth: 0
    }}>
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        background: 'white', color: C.violet,
        borderRadius: 10, boxShadow: '0 2px 8px #2410440A'
      }}>
        <Icon size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          color: C.muted, fontSize: 10, fontWeight: 800,
          letterSpacing: 0.6, margin: 0
        }}>{label.toUpperCase()}</p>
        <div style={{
          color: C.charcoal, fontSize: 13,
          fontWeight: 600, marginTop: 6,
          overflowWrap: 'anywhere'
        }}>{children}</div>
      </div>
    </div>
  )
}

function ModalShell({ title, onClose, children }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: '#17102499', backdropFilter: 'blur(5px)'
        }}
      />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 81,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16
      }}>
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.97 }}
          style={{
            width: '100%', maxWidth: 650,
            background: 'white', borderRadius: 23,
            boxShadow: '0 25px 80px #16082D55',
            maxHeight: '90vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: `1px solid ${C.border}`
          }}>
            <h2 style={{ color: C.charcoal, fontSize: 19, fontWeight: 800, margin: 0 }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 35, height: 35, border: 0,
                borderRadius: 10, background: C.lavender,
                color: C.charcoal, display: 'grid',
                placeItems: 'center', cursor: 'pointer'
              }}
            >
              <X size={19} />
            </button>
          </div>
          <div style={{ overflowY: 'auto' }}>
            {children}
          </div>
        </motion.div>
      </div>
    </>
  )
}

function StoreDetailsModal({ store, onClose }) {
  const websiteHref = toSafeUrl(store.website)
  const mapsHref = toSafeUrl(store.mapsUrl)

  return (
    <ModalShell title="Store Details" onClose={onClose}>
      <div style={{
        height: 190, position: 'relative',
        background: 'linear-gradient(135deg, #241044, #7655D9, #38BDF8)'
      }}>
        <StoreImage
          src={store.imageUrl}
          name={store.name}
          className="w-full h-full"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #241044CC, transparent)'
        }} />
        <div style={{ position: 'absolute', bottom: 17, left: 22, right: 22 }}>
          <h2 style={{
            color: 'white', fontSize: 23,
            fontWeight: 800, margin: 0
          }}>{store.name || 'Unnamed Store'}</h2>
          {store.category && (
            <span style={{
              display: 'inline-block', marginTop: 8,
              background: '#FFFFFF25', color: 'white',
              border: '1px solid #FFFFFF50',
              borderRadius: 20, padding: '5px 12px', fontSize: 11
            }}>{store.category}</span>
          )}
        </div>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          flexWrap: 'wrap', gap: 18,
          background: 'linear-gradient(110deg, #F5F3FF, #E7F7FF)',
          borderRadius: 15, padding: 16, marginBottom: 19
        }}>
          <StarRating value={store.averageRating} size={18} />
          <span style={{
            display: 'flex', alignItems: 'center',
            gap: 7, color: C.charcoal, fontSize: 12, fontWeight: 600
          }}>
            <MessageSquare size={16} color={C.violet} />
            {store.totalRatings} {store.totalRatings === 1 ? 'Rating' : 'Ratings'}
          </span>
        </div>

        {store.description && (
          <div style={{ marginBottom: 18 }}>
            <p style={{
              color: C.violet, fontSize: 11,
              fontWeight: 800, marginBottom: 7
            }}>ABOUT THIS STORE</p>
            <p style={{
              color: C.charcoal, fontSize: 13,
              lineHeight: 1.7, margin: 0
            }}>{store.description}</p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 11
        }}>
          {store.email && (
            <DetailRow icon={Mail} label="Email">{store.email}</DetailRow>
          )}
          {store.phone && (
            <DetailRow icon={Phone} label="Contact Number">{store.phone}</DetailRow>
          )}
          {store.address && (
            <DetailRow icon={MapPin} label="Full Address">{store.address}</DetailRow>
          )}
          {store.ownerName && (
            <DetailRow icon={UserRound} label="Store Owner">{store.ownerName}</DetailRow>
          )}
          {store.openingHours && (
            <DetailRow icon={Clock} label="Opening Hours">{store.openingHours}</DetailRow>
          )}
          {websiteHref && (
            <DetailRow icon={Globe} label="Website">
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.violet, display: 'inline-flex', gap: 5, alignItems: 'center' }}
              >
                Visit Website <ExternalLink size={13} />
              </a>
            </DetailRow>
          )}
          {mapsHref && (
            <DetailRow icon={MapIcon} label="Google Maps">
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.violet, display: 'inline-flex', gap: 5, alignItems: 'center' }}
              >
                View Location <ExternalLink size={13} />
              </a>
            </DetailRow>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 20, padding: 13,
            border: 0, borderRadius: 12,
            background: `linear-gradient(100deg, ${C.violet}, ${C.blue})`,
            color: 'white', fontWeight: 700, cursor: 'pointer'
          }}
        >
          Close Details
        </button>
      </div>
    </ModalShell>
  )
}

function StateMessage({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '55px 20px'
      }}
    >
      <div style={{
        width: 65, height: 65, borderRadius: 20,
        background: '#EEE8FF', color: C.violet,
        display: 'grid', placeItems: 'center', marginBottom: 16
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ color: C.charcoal, fontWeight: 800, fontSize: 17, margin: 0 }}>{title}</h3>
      <p style={{
        color: C.muted, fontSize: 13,
        maxWidth: 360, lineHeight: 1.7, margin: '9px 0 16px'
      }}>{description}</p>
      {action}
    </motion.div>
  )
}

function TableSkeleton() {
  return (
    <div style={{ padding: 22 }}>
      {[1, 2, 3, 4, 5].map(item => (
        <div key={item} style={{
          height: 58, marginBottom: 12,
          borderRadius: 10, background: '#F0ECF7',
          animation: 'pulse 1.5s infinite'
        }} />
      ))}
    </div>
  )
}

export default function ManageStores() {
  const navigate = useNavigate()
  const [user] = useState(readStoredUser)
  const [stores, setStores] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortKey, setSortKey] = useState('name-asc')
  const [selectedStore, setSelectedStore] = useState(null)

  const adminName = user?.name || 'Administrator'
  const initials = adminName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    api.get('/admin/stores', { signal: controller.signal })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.stores
        if (!Array.isArray(list)) {
          throw new Error('Unexpected response from the server.')
        }
        setStores(list.map(normalizeStore))
        setStatus('success')
      })
      .catch(error => {
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return
        setErrorMessage(getErrorMessage(error))
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadKey])

  const categories = useMemo(() => {
    return [...new Set(stores.map(store => store.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
  }, [stores])

  const summary = useMemo(() => {
    const totalRatings = stores.reduce((sum, store) => sum + store.totalRatings, 0)

    const ratedStores = stores.filter(
      store => store.averageRating !== null && store.totalRatings > 0
    )

    const averageRating = totalRatings > 0
      ? ratedStores.reduce(
          (sum, store) => sum + store.averageRating * store.totalRatings, 0
        ) / totalRatings
      : null

    return {
      totalStores: stores.length,
      totalRatings,
      averageRating,
      categoryCount: categories.length
    }
  }, [stores, categories])

  const visibleStores = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const filtered = stores.filter(store => {
      if (categoryFilter !== 'all' && store.category !== categoryFilter) return false
      if (!query) return true

      return [store.name, store.email, store.address, store.category]
        .some(field => String(field || '').toLowerCase().includes(query))
    })

    const comparators = {
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      'email-asc': (a, b) => a.email.localeCompare(b.email),
      'email-desc': (a, b) => b.email.localeCompare(a.email),
      'rating-desc': (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
      'rating-asc': (a, b) => (a.averageRating ?? 0) - (b.averageRating ?? 0),
      'rated-desc': (a, b) => b.totalRatings - a.totalRatings,
      'rated-asc': (a, b) => a.totalRatings - b.totalRatings
    }

    return [...filtered].sort(comparators[sortKey])
  }, [stores, searchTerm, categoryFilter, sortKey])

  const hasActiveFilters = searchTerm.trim() !== '' || categoryFilter !== 'all'

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('You have been logged out.')
    navigate('/', { replace: true })
  }

  const buttonStyle = {
    display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', gap: 7,
    padding: '9px 13px', borderRadius: 9,
    fontSize: 12, fontWeight: 700, cursor: 'pointer'
  }

  const renderBody = () => {
    if (status === 'loading') return <TableSkeleton />

    if (status === 'error') {
      return (
        <StateMessage
          icon={TriangleAlert}
          title="Could not load stores"
          description={errorMessage}
          action={
            <button
              onClick={() => setReloadKey(key => key + 1)}
              style={{ ...buttonStyle, background: C.violet, color: 'white', border: 0 }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
          }
        />
      )
    }

    if (stores.length === 0) {
      return (
        <StateMessage
          icon={Store}
          title="No stores found"
          description="Stores registered on the platform will appear here."
        />
      )
    }

    if (visibleStores.length === 0) {
      return (
        <StateMessage
          icon={Search}
          title="No matching stores"
          description="Try changing your search or category filter."
          action={
            <button
              onClick={clearFilters}
              style={{ ...buttonStyle, background: C.violet, color: 'white', border: 0 }}
            >
              Clear Filters
            </button>
          }
        />
      )
    }

    return (
      <>
        <div style={{ overflowX: 'auto' }} className="stores-desktop-table">
          <table style={{ width: '100%', minWidth: 1050, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F3EFFB' }}>
                {['IMAGE', 'STORE DETAILS', 'CATEGORY', 'ADDRESS', 'RATING', 'TOTAL RATINGS', 'OWNER', 'ACTIONS'].map(item => (
                  <th key={item} style={{
                    padding: '16px 15px', color: C.muted,
                    fontSize: 10, fontWeight: 800,
                    letterSpacing: 0.7, whiteSpace: 'nowrap'
                  }}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleStores.map((store, index) => (
                <motion.tr
                  key={store.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 8) * 0.035 }}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <td style={{ padding: '13px 15px' }}>
                    <StoreImage
                      src={store.imageUrl}
                      name={store.name}
                      className="store-table-image"
                    />
                  </td>
                  <td style={{ padding: '13px 15px', minWidth: 190 }}>
                    <p style={{ color: C.charcoal, fontSize: 12, fontWeight: 800, margin: 0 }}>
                      {store.name || '-'}
                    </p>
                    <p style={{ color: C.muted, fontSize: 11, margin: '5px 0 0' }}>
                      {store.email || '-'}
                    </p>
                  </td>
                  <td style={{ padding: '13px 15px' }}>
                    {store.category ? (
                      <span style={{
                        display: 'inline-block', padding: '6px 10px',
                        borderRadius: 20, background: '#E3F5FF',
                        color: '#1675A8', fontSize: 10, fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}>{store.category}</span>
                    ) : <span style={{ color: C.muted }}>-</span>}
                  </td>
                  <td style={{
                    padding: '13px 15px', color: C.muted,
                    fontSize: 11, maxWidth: 180
                  }}>
                    <span title={store.address} style={{
                      display: 'block', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{store.address || '-'}</span>
                  </td>
                  <td style={{ padding: '13px 15px', whiteSpace: 'nowrap' }}>
                    <StarRating value={store.averageRating} />
                  </td>
                  <td style={{
                    padding: '13px 15px', color: C.charcoal,
                    fontSize: 12, fontWeight: 700
                  }}>{store.totalRatings.toLocaleString()}</td>
                  <td style={{
                    padding: '13px 15px', color: C.muted,
                    fontSize: 12
                  }}>{store.ownerName || '-'}</td>
                  <td style={{ padding: '13px 15px' }}>
                    <button
                      onClick={() => setSelectedStore(store)}
                      style={{
                        ...buttonStyle, background: C.violet,
                        color: 'white', border: 0,
                        boxShadow: '0 4px 12px #7655D933'
                      }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stores-mobile-cards">
          {visibleStores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.04 }}
              whileHover={{ y: -3 }}
              style={{
                background: 'white', border: `1px solid ${C.border}`,
                borderRadius: 17, padding: 16, marginBottom: 13
              }}
            >
              <div style={{ display: 'flex', gap: 13 }}>
                <StoreImage
                  src={store.imageUrl}
                  name={store.name}
                  className="store-mobile-image"
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    color: C.charcoal, fontSize: 13,
                    fontWeight: 800, margin: 0
                  }}>{store.name || '-'}</p>
                  <p style={{
                    color: C.muted, fontSize: 11,
                    margin: '5px 0', overflowWrap: 'anywhere'
                  }}>{store.email || '-'}</p>
                  {store.category && (
                    <span style={{
                      display: 'inline-block', padding: '4px 9px',
                      borderRadius: 20, background: '#E3F5FF',
                      color: '#1675A8', fontSize: 10, fontWeight: 700
                    }}>{store.category}</span>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center',
                flexWrap: 'wrap', gap: 13, marginTop: 14
              }}>
                <StarRating value={store.averageRating} />
                <span style={{ fontSize: 11, color: C.muted }}>
                  {store.totalRatings} ratings
                </span>
              </div>

              {store.address && (
                <p style={{
                  color: C.muted, fontSize: 11,
                  margin: '12px 0 0', lineHeight: 1.5
                }}>{store.address}</p>
              )}

              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 10,
                borderTop: `1px solid ${C.border}`,
                paddingTop: 13, marginTop: 13
              }}>
                <span style={{ color: C.muted, fontSize: 11 }}>
                  Owner: {store.ownerName || '-'}
                </span>
                <button
                  onClick={() => setSelectedStore(store)}
                  style={{
                    ...buttonStyle, background: C.violet,
                    color: 'white', border: 0
                  }}
                >
                  <Eye size={14} /> View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: C.lavender,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        .stores-main { min-width: 0; flex: 1; }
        .stores-sidebar {
          position: sticky; top: 0; width: 255px;
          height: 100vh; flex-shrink: 0;
          display: flex; flex-direction: column;
          background: linear-gradient(180deg, #241044, #190B30);
        }
        .stores-header {
          position: sticky; top: 0; z-index: 20;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          padding: 16px 30px;
          background: #FFFFFFDD; backdrop-filter: blur(15px);
          border-bottom: 1px solid #E9E2F7;
        }
        .stores-content { padding: 30px; }
        .stores-toolbar {
          display: flex; flex-wrap: wrap;
          align-items: center; gap: 12px;
        }
        .stores-search { flex: 1; min-width: 220px; position: relative; }
        .stores-search input, .stores-select {
          width: 100%; padding: 12px 14px;
          border: 1px solid #E5DDF3; border-radius: 11px;
          background: white; color: #25213A;
          outline: none; font-size: 12px;
        }
        .stores-search input { padding-left: 40px; }
        .stores-search input:focus, .stores-select:focus {
          border-color: #7655D9;
          box-shadow: 0 0 0 3px #7655D922;
        }
        .stores-select { min-width: 165px; cursor: pointer; }
        .stores-menu-button { display: none; }
        .stores-mobile-cards { display: none; padding: 14px; }
        .store-table-image {
          width: 58px; height: 48px;
          border-radius: 11px; display: block;
        }
        .store-mobile-image {
          width: 76px; height: 76px;
          border-radius: 13px; flex-shrink: 0;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .55; }
        }
        @media(max-width: 1000px) {
          .stores-sidebar { display: none; }
          .stores-menu-button { display: grid; }
          .stores-content { padding: 20px 15px; }
          .stores-header { padding: 14px 16px; }
        }
        @media(max-width: 850px) {
          .stores-desktop-table { display: none; }
          .stores-mobile-cards { display: block; }
        }
        @media(max-width: 600px) {
          .stores-toolbar { flex-direction: column; align-items: stretch; }
          .stores-search { min-width: 100%; }
          .stores-select { width: 100%; }
        }
      `}</style>

      <aside className="stores-sidebar">
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
              style={{
                position: 'fixed', inset: 0,
                zIndex: 40, background: '#17102499'
              }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', zIndex: 50,
                inset: '0 auto 0 0', width: 275,
                display: 'flex', flexDirection: 'column',
                background: `linear-gradient(180deg, ${C.midnight}, #190B30)`
              }}
            >
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  position: 'absolute', right: 13, top: 13,
                  zIndex: 2, border: 0, background: '#FFFFFF18',
                  color: 'white', borderRadius: 9, padding: 8
                }}
              >
                <X size={19} />
              </button>
              <SidebarContent
                onNavigate={() => setIsDrawerOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="stores-main">
        <header className="stores-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="stores-menu-button"
              onClick={() => setIsDrawerOpen(true)}
              style={{
                border: 0, background: '#EEE8FF',
                color: C.violet, padding: 9,
                borderRadius: 10, cursor: 'pointer'
              }}
            >
              <Menu size={20} />
            </button>
            <div>
              <p style={{
                color: C.charcoal, fontWeight: 800,
                fontSize: 15, margin: 0
              }}>Manage Stores</p>
              <p style={{ color: C.muted, fontSize: 10, margin: '3px 0 0' }}>
                Administration / Stores
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                color: C.charcoal, fontWeight: 700,
                fontSize: 12, margin: 0
              }}>{adminName}</p>
              <p style={{ color: C.violet, fontSize: 10, margin: '4px 0 0' }}>
                System Administrator
              </p>
            </div>
            <div style={{
              width: 41, height: 41, borderRadius: 14,
              background: 'linear-gradient(135deg, #7655D9, #38BDF8)',
              display: 'grid', placeItems: 'center',
              color: 'white', fontWeight: 800, fontSize: 13,
              boxShadow: '0 5px 15px #7655D944'
            }}>{initials}</div>
          </div>
        </header>

        <main className="stores-content">
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '25px 27px', borderRadius: 21,
              background: 'linear-gradient(110deg, #241044, #42216F 65%, #315A91)',
              marginBottom: 25,
              boxShadow: '0 12px 30px #24104422'
            }}
          >
            <div style={{
              position: 'absolute', width: 180, height: 180,
              borderRadius: '50%', background: C.blue,
              opacity: 0.12, filter: 'blur(35px)',
              right: 20, top: -100
            }} />
            <div style={{
              position: 'relative', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: 15
            }}>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 7, color: '#B9A5F2',
                  fontSize: 10, fontWeight: 800, letterSpacing: 1.4
                }}>
                  <Sparkles size={13} /> STORE MANAGEMENT
                </div>
                <h1 style={{
                  color: 'white', fontSize: 'clamp(23px, 3vw, 30px)',
                  fontWeight: 800, margin: '10px 0 7px'
                }}>Manage Your Stores</h1>
                <p style={{
                  color: '#D3C9E8', fontSize: 12,
                  margin: 0, lineHeight: 1.6
                }}>
                  View, search and manage all registered stores.
                </p>
              </div>
              <div style={{
                width: 65, height: 65, borderRadius: 20,
                display: 'grid', placeItems: 'center',
                background: '#FFFFFF15',
                border: '1px solid #FFFFFF30',
                color: C.blue, flexShrink: 0
              }}>
                <Store size={31} />
              </div>
            </div>
          </motion.section>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 15, marginBottom: 25
          }}>
            {status === 'loading' ? (
              [1, 2, 3, 4].map(item => (
                <div key={item} style={{
                  height: 110, borderRadius: 19,
                  background: 'white', border: `1px solid ${C.border}`,
                  animation: 'pulse 1.5s infinite'
                }} />
              ))
            ) : status === 'success' ? (
              <>
                <StatCard
                  label="Total Stores"
                  value={summary.totalStores.toLocaleString()}
                  icon={Store} index={0}
                  gradient="linear-gradient(135deg, #7655D9, #9A75ED)"
                />
                <StatCard
                  label="Total Ratings"
                  value={summary.totalRatings.toLocaleString()}
                  icon={MessageSquare} index={1}
                  gradient="linear-gradient(135deg, #1685C0, #38BDF8)"
                />
                <StatCard
                  label="Average Store Rating"
                  value={summary.averageRating === null ? '-' : summary.averageRating.toFixed(1)}
                  icon={Star} index={2}
                  gradient="linear-gradient(135deg, #49318D, #7655D9)"
                />
                <StatCard
                  label="Store Categories"
                  value={summary.categoryCount.toLocaleString()}
                  icon={Layers} index={3}
                  gradient="linear-gradient(135deg, #3972A6, #7655D9)"
                />
              </>
            ) : null}
          </div>

          <section style={{
            background: 'white', border: `1px solid ${C.border}`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 8px 30px #2410440B'
          }}>
            <div style={{
              padding: '19px 21px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 14
            }}>
              <div>
                <h2 style={{
                  color: C.charcoal, fontSize: 15,
                  fontWeight: 800, margin: 0
                }}>All Registered Stores</h2>
                <p style={{
                  color: C.muted, fontSize: 11,
                  margin: '5px 0 0'
                }}>
                  {status === 'success'
                    ? `${visibleStores.length} stores displayed`
                    : 'Loading store records...'}
                </p>
              </div>
              <div style={{
                background: '#F0EAFF', color: C.violet,
                borderRadius: 9, padding: '7px 11px',
                fontSize: 11, fontWeight: 800
              }}>
                <Store size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {stores.length} TOTAL
              </div>
            </div>

            <div style={{
              padding: '17px 20px',
              borderBottom: `1px solid ${C.border}`,
              background: '#FCFBFE'
            }}>
              <div className="stores-toolbar">
                <div className="stores-search">
                  <Search size={16} style={{
                    position: 'absolute', left: 13,
                    top: '50%', transform: 'translateY(-50%)',
                    color: '#9186A5'
                  }} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                    placeholder="Search store name, email, address..."
                  />
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7
                }}>
                  <Layers size={15} color={C.violet} />
                  <select
                    className="stores-select"
                    value={categoryFilter}
                    onChange={event => setCategoryFilter(event.target.value)}
                    aria-label="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7
                }}>
                  <ArrowDownUp size={15} color={C.violet} />
                  <select
                    className="stores-select"
                    value={sortKey}
                    onChange={event => setSortKey(event.target.value)}
                    aria-label="Sort stores"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    style={{
                      border: '1px solid #E4D9F7',
                      borderRadius: 10, padding: '11px 14px',
                      background: '#F0EAFF', color: C.violet,
                      fontWeight: 700, fontSize: 12, cursor: 'pointer'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {renderBody()}
          </section>

          <p style={{
            textAlign: 'center', color: '#9891A6',
            fontSize: 10, padding: '22px 0 5px'
          }}>
            Store Rating System · Admin Control Panel
          </p>
        </main>
      </div>

      <AnimatePresence>
        {selectedStore && (
          <StoreDetailsModal
            key="store-details"
            store={selectedStore}
            onClose={() => setSelectedStore(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
