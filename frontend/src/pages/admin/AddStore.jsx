
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  ArrowLeft,
  Clock,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Store,
  Tag,
  Trash2,
  Upload,
  UserPlus,
  UserRound,
  Users,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import api from '../../services/api.js'

const C = {
  midnight: '#241044',
  violet: '#7655D9',
  electric: '#38BDF8',
  lavender: '#F5F3FF',
  charcoal: '#25213A',
  yellow: '#FBBF24',
  muted: '#8B849B',
  white: '#FFFFFF',
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Manage Users', to: '/admin/users', icon: Users },
  { label: 'Manage Stores', to: '/admin/stores', icon: Store },
  { label: 'Add User', to: '/admin/users/new', icon: UserPlus },
  { label: 'Add Store', to: '/admin/stores/new', icon: Plus },
]

const CATEGORY_OPTIONS = [
  'Restaurant',
  'Grocery',
  'Electronics',
  'Fashion',
  'Pharmacy',
  'Books & Stationery',
  'Home & Living',
  'Health & Beauty',
  'Services',
  'Other',
]

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/

const INITIAL_VALUES = {
  name: '',
  email: '',
  address: '',
  category: '',
  description: '',
  contactNumber: '',
  openingHours: '',
  website: '',
  mapsUrl: '',
  ownerId: '',
}

const inputStyle = (error, hasIcon = false) => ({
  width: '100%',
  padding: hasIcon ? '13px 15px 13px 44px' : '13px 15px',
  borderRadius: '12px',
  border: `1px solid ${error ? '#FCA5A5' : '#E5DDF5'}`,
  background: '#FFFFFF',
  color: C.charcoal,
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
})

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function normalizeOwner(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    email: raw.email ?? '',
    role: raw.role ?? '',
  }
}

function toSafeUrl(value) {
  if (!value) return null

  const candidate = /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`

  try {
    const url = new URL(candidate)

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : null
  } catch {
    return null
  }
}

function validateStoreForm(values) {
  const errors = {}

  const name = values.name.trim()

  if (name.length < 1 || name.length > 20) {
    errors.name = 'Store name must be between 1 and 20 characters.'
  }

  const email = values.email.trim()

  if (!email) {
    errors.email = 'Store email is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  const address = values.address.trim()

  if (!address) {
    errors.address = 'Full address is required.'
  } else if (address.length > 400) {
    errors.address = 'Address must be 400 characters or fewer.'
  }

  if (!values.category) {
    errors.category = 'Please choose a category.'
  }

  if (!values.description.trim()) {
    errors.description = 'Store description is required.'
  }

  const phone = values.contactNumber.trim()

  if (!phone) {
    errors.contactNumber = 'Contact number is required.'
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.contactNumber = 'Enter a valid contact number.'
  }

  if (!values.openingHours.trim()) {
    errors.openingHours = 'Opening hours are required.'
  }

  if (values.website.trim() && !toSafeUrl(values.website.trim())) {
    errors.website = 'Please enter a valid website address.'
  }

  if (values.mapsUrl.trim() && !toSafeUrl(values.mapsUrl.trim())) {
    errors.mapsUrl = 'Please enter a valid Google Maps link.'
  }

  if (!values.ownerId) {
    errors.ownerId = 'Please choose a store owner.'
  }

  return errors
}

function getSubmitErrorMessages(error) {
  const data = error.response?.data

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => typeof item === 'string' ? item : item.msg || item.message)
      .filter(Boolean)
  }

  if (data?.message) return [data.message]

  if (error.request && !error.response) {
    return ['Cannot reach the server. Please make sure the backend is running.']
  }

  return ['Could not add the store. Please try again.']
}

function SidebarContent({ onNavigate, onLogout }) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-7">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${C.violet}, ${C.electric})`,
          }}
        >
          <Store className="h-5 w-5 text-white" />
        </div>

        <div>
          <p className="text-base font-extrabold tracking-wide text-white">
            Store Rating
          </p>
          <p className="text-xs text-white/50">Admin Panel</p>
        </div>
      </div>

      <div className="mx-5 mb-5 h-px bg-white/10" />

      <p className="px-6 pb-3 text-[10px] font-bold uppercase tracking-[2px] text-white/35">
        Main Menu
      </p>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="admin-nav-indicator"
                    className="absolute left-0 top-2 h-[calc(100%-16px)] w-1 rounded-r-full"
                    style={{ background: C.electric }}
                  />
                )}

                <Icon
                  className="h-5 w-5 shrink-0"
                  style={{
                    color: isActive ? C.electric : 'currentColor',
                  }}
                />

                {label}

                {isActive && (
                  <span
                    className="ml-auto h-2 w-2 rounded-full"
                    style={{ background: C.electric }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-5 mt-5 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-white/60 transition hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

      <div className="m-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white">
          <ShieldCheck className="h-4 w-4" style={{ color: C.electric }} />
          Secure Admin Panel
        </div>

        <p className="text-[11px] leading-relaxed text-white/40">
          Manage stores, users and ratings from one place.
        </p>
      </div>
    </>
  )
}

function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  icon: Icon,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-1 text-sm font-bold"
        style={{ color: C.charcoal }}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2"
            style={{ color: C.muted }}
          />
        )}

        {children}
      </div>

      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p className="mt-1.5 text-xs" style={{ color: C.muted }}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section
      className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7"
      style={{
        borderColor: '#EAE4F5',
        boxShadow: '0 8px 30px rgba(36,16,68,0.04)',
      }}
    >
      <div className="mb-6 flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: '#F0EAFE' }}
        >
          <Icon className="h-5 w-5" style={{ color: C.violet }} />
        </div>

        <div>
          <h2 className="text-base font-extrabold" style={{ color: C.charcoal }}>
            {title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: C.muted }}>
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  )
}

function ImageUploader({ previewUrl, error, onSelect, onRemove }) {
  return (
    <div>
      <input
        id="store-image"
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={onSelect}
        className="sr-only"
      />

      <AnimatePresence mode="wait" initial={false}>
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-2xl border bg-white"
            style={{ borderColor: '#E5DDF5' }}
          >
            <img
              src={previewUrl}
              alt="Selected store preview"
              className="h-56 w-full object-cover sm:h-64"
            />

            <div
              className="flex flex-wrap items-center justify-between gap-3 border-t p-4"
              style={{ borderColor: '#EEE8F8' }}
            >
              <label
                htmlFor="store-image"
                className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                style={{ background: C.violet }}
              >
                <span className="flex items-center gap-2">
                  <Upload size={15} />
                  Replace Image
                </span>
              </label>

              <button
                type="button"
                onClick={onRemove}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={15} />
                Remove Image
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="dropzone"
            htmlFor="store-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.01 }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-all hover:bg-purple-50/60"
            style={{
              borderColor: error ? '#F87171' : '#C9B8F2',
              background: '#FAF8FF',
            }}
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${C.violet}, ${C.electric})`,
              }}
            >
              <Upload className="h-7 w-7 text-white" />
            </div>

            <p className="text-sm font-extrabold" style={{ color: C.charcoal }}>
              Click to upload store image
            </p>

            <p className="mt-2 text-xs" style={{ color: C.muted }}>
              JPG, PNG or WebP · Maximum 5 MB
            </p>

            <span
              className="mt-4 rounded-lg px-4 py-2 text-xs font-bold"
              style={{ background: '#EEE8FF', color: C.violet }}
            >
              Browse Files
            </span>
          </motion.label>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default function AddStore() {
  const navigate = useNavigate()

  const [user] = useState(readStoredUser)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [owners, setOwners] = useState([])
  const [ownersStatus, setOwnersStatus] = useState('loading')
  const [ownersReloadKey, setOwnersReloadKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const adminName = user?.name || 'Administrator'

  const initials = adminName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    const controller = new AbortController()

    setOwnersStatus('loading')

    api.get('/admin/users', { signal: controller.signal })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.users

        if (!Array.isArray(list)) {
          throw new Error('Unexpected response from server')
        }

        setOwners(
          list
            .map(normalizeOwner)
            .filter((item) => item.role === 'owner')
        )

        setOwnersStatus('success')
      })
      .catch((error) => {
        if (axios.isCancel(error)) return
        setOwnersStatus('error')
      })

    return () => controller.abort()
  }, [ownersReloadKey])

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    let imageError

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      imageError = 'Only JPG, PNG or WebP images are allowed.'
    } else if (file.size > MAX_IMAGE_BYTES) {
      imageError = 'Image must be 5 MB or smaller.'
    }

    setErrors((prev) => ({
      ...prev,
      image: imageError,
    }))

    if (!imageError) {
      setImageFile(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)

    setErrors((prev) => ({
      ...prev,
      image: undefined,
    }))
  }

  const handleReset = () => {
    setValues(INITIAL_VALUES)
    setErrors({})
    setImageFile(null)
  }

  const handleCancel = () => {
    navigate('/admin/stores')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateStoreForm(values)

    if (errors.image) {
      validationErrors.image = errors.image
    }

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted fields and try again.')
      return
    }

    const formData = new FormData()

    formData.append('name', values.name.trim())
    formData.append('email', values.email.trim())
    formData.append('address', values.address.trim())
    formData.append('category', values.category)
    formData.append('description', values.description.trim())
    formData.append('contact_number', values.contactNumber.trim())
    formData.append('opening_hours', values.openingHours.trim())

    formData.append(
      'website_url',
      toSafeUrl(values.website.trim()) ?? ''
    )

    formData.append(
      'location_url',
      toSafeUrl(values.mapsUrl.trim()) ?? ''
    )

    formData.append('owner_id', values.ownerId)

    if (imageFile) {
      formData.append('image', imageFile)
    }

    setIsSubmitting(true)

    try {
      await api.post('/admin/stores', formData)

      toast.success('Store added successfully.')
      navigate('/admin/stores')
    } catch (error) {
      getSubmitErrorMessages(error).forEach((message) => {
        toast.error(message)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeDrawer = () => setIsDrawerOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    toast.success('You have been logged out.')
    navigate('/', { replace: true })
  }

  const ownerPlaceholder = {
    loading: 'Loading owners...',
    error: 'Could not load owners',
    success: owners.length === 0
      ? 'No store owners found'
      : 'Select a store owner',
  }[ownersStatus]

  const fieldClass =
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#25213A] outline-none transition-all focus:border-[#7655D9] focus:ring-4 focus:ring-[#7655D9]/10 disabled:opacity-60'

  const iconFieldClass = fieldClass

  return (
    <div className="min-h-screen lg:flex" style={{ background: C.lavender }}>
      <aside
        className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col lg:flex"
        style={{
          background: `linear-gradient(180deg, ${C.midnight}, #190B32)`,
        }}
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
              style={{
                background: `linear-gradient(180deg, ${C.midnight}, #190B32)`,
              }}
            >
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="absolute right-4 top-4 rounded-lg p-2 text-white/70 hover:bg-white/10"
              >
                <X size={20} />
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
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/70 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="rounded-xl p-2 transition hover:bg-purple-50 lg:hidden"
              style={{ color: C.charcoal }}
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-base font-extrabold sm:text-lg" style={{ color: C.charcoal }}>
                Add Store
              </p>
              <p className="text-xs" style={{ color: C.muted }}>
                Administration / Stores / Add Store
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold" style={{ color: C.charcoal }}>
                {adminName}
              </p>
              <p className="text-xs font-semibold" style={{ color: C.violet }}>
                System Administrator
              </p>
            </div>

            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${C.violet}, ${C.electric})`,
              }}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-7 p-4 sm:p-7 lg:p-9">
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl sm:p-9"
            style={{
              background: `linear-gradient(120deg, ${C.midnight} 0%, ${C.violet} 58%, ${C.electric} 120%)`,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 7, repeat: Infinity }}
              className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl"
            />

            <div className="pointer-events-none absolute bottom-0 right-40 h-32 w-32 rounded-full border border-white/10" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur">
                <Sparkles size={14} />
                STORE MANAGEMENT
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
                Add a New Store
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                Register a new business, assign its owner and add store information to your platform.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={15} />
                  Admin Access
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  Form Validation
                </span>
              </div>
            </div>
          </motion.section>

          <motion.form
            noValidate
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-6"
          >
            <SectionCard
              icon={Store}
              title="Basic Store Information"
              description="Enter the main information that customers will see."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Store Name"
                  htmlFor="name"
                  required
                  error={errors.name}
                  hint="1 to 20 characters."
                  className="sm:col-span-2"
                >
                  <input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Enter store name"
                    minLength={1}
                    maxLength={20}
                    className={fieldClass}
                    style={inputStyle(errors.name)}
                  />
                </FormField>

                <FormField
                  label="Store Category"
                  htmlFor="category"
                  required
                  error={errors.category}
                  icon={Tag}
                >
                  <select
                    id="category"
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                    className={iconFieldClass}
                    style={inputStyle(errors.category, true)}
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Store Owner"
                  htmlFor="ownerId"
                  required
                  error={errors.ownerId || (ownersStatus === 'error' ? 'Could not load store owners.' : undefined)}
                  hint="Only users with Store Owner role are listed."
                  icon={UserRound}
                >
                  <select
                    id="ownerId"
                    name="ownerId"
                    value={values.ownerId}
                    onChange={handleChange}
                    disabled={ownersStatus !== 'success' || owners.length === 0}
                    className={iconFieldClass}
                    style={inputStyle(errors.ownerId, true)}
                  >
                    <option value="">{ownerPlaceholder}</option>

                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name || owner.email}
                        {owner.email && owner.name ? ` (${owner.email})` : ''}
                      </option>
                    ))}
                  </select>

                  {ownersStatus === 'error' && (
                    <button
                      type="button"
                      onClick={() => setOwnersReloadKey((key) => key + 1)}
                      className="mt-2 flex items-center gap-1.5 text-xs font-bold hover:underline"
                      style={{ color: C.violet }}
                    >
                      <RefreshCw size={13} />
                      Try loading owners again
                    </button>
                  )}
                </FormField>

                <FormField
                  label="Store Email"
                  htmlFor="email"
                  required
                  error={errors.email}
                  icon={Mail}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="store@example.com"
                    className={iconFieldClass}
                    style={inputStyle(errors.email, true)}
                  />
                </FormField>

                <FormField
                  label="Contact Number"
                  htmlFor="contactNumber"
                  required
                  error={errors.contactNumber}
                  icon={Phone}
                >
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={values.contactNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={iconFieldClass}
                    style={inputStyle(errors.contactNumber, true)}
                  />
                </FormField>

                <FormField
                  label="Opening Hours"
                  htmlFor="openingHours"
                  required
                  error={errors.openingHours}
                  hint="Example: Mon-Fri 9:00-18:00"
                  icon={Clock}
                >
                  <input
                    id="openingHours"
                    name="openingHours"
                    value={values.openingHours}
                    onChange={handleChange}
                    placeholder="Mon-Fri 9:00-18:00"
                    className={iconFieldClass}
                    style={inputStyle(errors.openingHours, true)}
                  />
                </FormField>

                <FormField
                  label="Full Address"
                  htmlFor="address"
                  required
                  error={errors.address}
                  hint="400 characters maximum."
                  className="sm:col-span-2"
                >
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={values.address}
                    onChange={handleChange}
                    placeholder="Street, city, state, postal code"
                    className={fieldClass}
                    style={inputStyle(errors.address)}
                  />
                </FormField>

                <FormField
                  label="Store Description"
                  htmlFor="description"
                  required
                  error={errors.description}
                  className="sm:col-span-2"
                >
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                    placeholder="Describe what the store offers..."
                    className={fieldClass}
                    style={inputStyle(errors.description)}
                  />
                </FormField>
              </div>
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="Store Image"
              description="Upload an image to represent this store."
            >
              <ImageUploader
                previewUrl={previewUrl}
                error={errors.image}
                onSelect={handleImageSelect}
                onRemove={handleRemoveImage}
              />
            </SectionCard>

            <SectionCard
              icon={Globe}
              title="Online Presence & Location"
              description="Website and Google Maps links are optional."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Website URL (Optional)"
                  htmlFor="website"
                  error={errors.website}
                  hint="Example: www.yourstore.com"
                  icon={Globe}
                >
                  <input
                    id="website"
                    name="website"
                    value={values.website}
                    onChange={handleChange}
                    placeholder="https://www.yourstore.com"
                    className={iconFieldClass}
                    style={inputStyle(errors.website, true)}
                  />
                </FormField>

                <FormField
                  label="Google Maps Location URL (Optional)"
                  htmlFor="mapsUrl"
                  error={errors.mapsUrl}
                  hint="Paste the share link from Google Maps."
                  icon={MapPin}
                >
                  <input
                    id="mapsUrl"
                    name="mapsUrl"
                    value={values.mapsUrl}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    className={iconFieldClass}
                    style={inputStyle(errors.mapsUrl, true)}
                  />
                </FormField>
              </div>
            </SectionCard>

            <div
              className="flex flex-col-reverse gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
              style={{ borderColor: '#EAE4F5' }}
            >
              <p className="text-xs" style={{ color: C.muted }}>
                <span className="font-bold text-red-500">*</span> Required fields
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition hover:bg-purple-50 disabled:opacity-50"
                  style={{ borderColor: '#DDD3F0', color: C.charcoal }}
                >
                  <ArrowLeft size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition hover:bg-sky-50 disabled:opacity-50"
                  style={{
                    borderColor: '#BAE6FD',
                    background: '#F0F9FF',
                    color: '#0369A1',
                  }}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background: `linear-gradient(135deg, ${C.violet}, ${C.electric})`,
                    boxShadow: '0 8px 20px rgba(118,85,217,0.25)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Adding Store...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Store
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>

          <footer className="pb-3 text-center text-xs" style={{ color: C.muted }}>
            Store Rating System · Admin Management Panel
          </footer>
        </main>
      </div>
    </div>
  )
}
