
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  AlertTriangle, ArrowDownUp, Eye, LayoutDashboard, LogOut,
  Mail, Menu, Plus, RefreshCw, Search, Shield, Store,
  Trash2, UserPlus, Users, X, MapPin, CalendarDays,
  UserRound, Filter, Sparkles
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
  red: '#DC5252'
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Manage Users', to: '/admin/users', icon: Users },
  { label: 'Manage Stores', to: '/admin/stores', icon: Store },
  { label: 'Add User', to: '/admin/users/new', icon: UserPlus },
  { label: 'Add Store', to: '/admin/stores/new', icon: Plus },
]

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'Normal User' },
  { value: 'owner', label: 'Store Owner' },
]

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'email-asc', label: 'Email (A-Z)' },
  { value: 'email-desc', label: 'Email (Z-A)' },
  { value: 'created-desc', label: 'Newest First' },
  { value: 'created-asc', label: 'Oldest First' },
]

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function normalizeUser(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    email: raw.email ?? '',
    address: raw.address ?? '',
    role: raw.role ?? '',
    createdAt: raw.createdAt ?? raw.created_at ?? null
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

function getErrorMessage(error, fallback) {
  if (error.response?.data?.message) return error.response.data.message
  if (error.request && !error.response) {
    return 'Cannot reach the server. Please make sure the backend is running.'
  }
  return error.message || fallback
}

function RoleBadge({ role }) {
  const styles = {
    admin: { label: 'Admin', bg: '#F0E9FF', color: '#7045C5' },
    user: { label: 'Normal User', bg: '#E4F6FF', color: '#1675A8' },
    owner: { label: 'Store Owner', bg: '#EAE5FA', color: '#49318D' }
  }

  const current = styles[role] || {
    label: role || 'Unknown',
    bg: '#F0EFF3',
    color: '#625D70'
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 11px',
        borderRadius: 30,
        background: current.bg,
        color: current.color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap'
      }}
    >
      <Shield size={12} />
      {current.label}
    </span>
  )
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

function SummaryCard({ label, value, icon: Icon, index, gradient }) {
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
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, margin: 0 }}>{label}</p>
          <h2 style={{ color: C.charcoal, fontSize: 30, fontWeight: 800, margin: '10px 0 0' }}>
            {value.toLocaleString()}
          </h2>
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
            width: '100%', maxWidth: 510, background: 'white',
            borderRadius: 23, padding: 25,
            boxShadow: '0 25px 80px #16082D55',
            maxHeight: '90vh', overflowY: 'auto'
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 23
          }}>
            <h2 style={{ color: C.charcoal, fontSize: 20, fontWeight: 800, margin: 0 }}>
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
          {children}
        </motion.div>
      </div>
    </>
  )
}

function UserDetailsModal({ user, onClose }) {
  const details = [
    { label: 'User ID', value: user.id, icon: UserRound },
    { label: 'Full Name', value: user.name || '-', icon: Users },
    { label: 'Email Address', value: user.email || '-', icon: Mail },
    { label: 'Role', value: <RoleBadge role={user.role} />, icon: Shield },
    { label: 'Registration Date', value: formatDate(user.createdAt), icon: CalendarDays },
    { label: 'Address', value: user.address || '-', icon: MapPin }
  ]

  return (
    <ModalShell title="User Details" onClose={onClose}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: 17, borderRadius: 16,
        background: `linear-gradient(120deg, ${C.midnight}, #493078)`,
        marginBottom: 20
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 15,
          display: 'grid', placeItems: 'center',
          background: `linear-gradient(135deg, ${C.violet}, ${C.blue})`,
          color: 'white', fontSize: 18, fontWeight: 800
        }}>
          {(user.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ color: 'white', fontWeight: 700, margin: 0, overflowWrap: 'anywhere' }}>{user.name}</p>
          <p style={{ color: '#C9BCE4', fontSize: 12, margin: '4px 0 0', overflowWrap: 'anywhere' }}>{user.email}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 11 }}>
        {details.map(({ label, value, icon: Icon }) => (
          <div key={label} style={{
            padding: 14, borderRadius: 13,
            background: C.lavender, minWidth: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.violet }}>
              <Icon size={14} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.6 }}>{label.toUpperCase()}</span>
            </div>
            <div style={{ color: C.charcoal, fontSize: 13, fontWeight: 600, marginTop: 9, overflowWrap: 'anywhere' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <button onClick={onClose} style={{
        marginTop: 22, width: '100%', padding: 13,
        border: 0, borderRadius: 12, color: 'white',
        background: `linear-gradient(100deg, ${C.violet}, ${C.blue})`,
        fontWeight: 700, cursor: 'pointer'
      }}>
        Close Details
      </button>
    </ModalShell>
  )
}

function DeleteUserModal({ user, isDeleting, onCancel, onConfirm }) {
  return (
    <ModalShell title="Delete User" onClose={onCancel}>
      <div style={{ textAlign: 'center', padding: '8px 5px 15px' }}>
        <div style={{
          width: 65, height: 65, borderRadius: 20,
          background: '#FFF0F0', color: C.red,
          display: 'grid', placeItems: 'center', margin: '0 auto 17px'
        }}>
          <Trash2 size={29} />
        </div>
        <h3 style={{ color: C.charcoal, fontSize: 18, fontWeight: 800, margin: 0 }}>
          Are you sure?
        </h3>
        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
          You are about to delete <strong style={{ color: C.charcoal }}>{user.name || user.email}</strong>.
          This action cannot be undone.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 11, marginTop: 12 }}>
        <button
          onClick={onCancel}
          disabled={isDeleting}
          style={{
            flex: 1, padding: 13, borderRadius: 12,
            border: `1px solid ${C.border}`, background: 'white',
            color: C.charcoal, fontWeight: 700, cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          style={{
            flex: 1, padding: 13, borderRadius: 12,
            border: 0, background: C.red, color: 'white',
            fontWeight: 700, cursor: 'pointer',
            opacity: isDeleting ? 0.7 : 1
          }}
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </ModalShell>
  )
}

function StateMessage({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      padding: '55px 20px', display: 'flex',
      alignItems: 'center', flexDirection: 'column',
      textAlign: 'center'
    }}>
      <div style={{
        width: 65, height: 65, borderRadius: 20,
        background: '#EEE8FF', color: C.violet,
        display: 'grid', placeItems: 'center', marginBottom: 16
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ color: C.charcoal, fontWeight: 800, fontSize: 17, margin: 0 }}>{title}</h3>
      <p style={{ color: C.muted, fontSize: 13, maxWidth: 360, lineHeight: 1.7 }}>{description}</p>
      {action}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div style={{ padding: 22 }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} style={{
          height: 53, marginBottom: 12, borderRadius: 10,
          background: 'linear-gradient(90deg, #F2EEF9, #FAF9FC, #F2EEF9)',
          backgroundSize: '200% 100%',
          animation: 'pulse 1.5s infinite'
        }} />
      ))}
    </div>
  )
}

export default function ManageUsers() {
  const navigate = useNavigate()
  const [user] = useState(readStoredUser)
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortKey, setSortKey] = useState('name-asc')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const adminName = user?.name || 'Administrator'
  const initials = adminName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    api.get('/admin/users', { signal: controller.signal })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.users
        if (!Array.isArray(list)) throw new Error('Unexpected response from the server.')
        setUsers(list.map(normalizeUser))
        setStatus('success')
      })
      .catch(error => {
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return
        setErrorMessage(getErrorMessage(error, 'Unable to load users.'))
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadKey])

  const summary = useMemo(() => ({
    total: users.length,
    admins: users.filter(item => item.role === 'admin').length,
    normalUsers: users.filter(item => item.role === 'user').length,
    owners: users.filter(item => item.role === 'owner').length
  }), [users])

  const visibleUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const filtered = users.filter(item => {
      if (roleFilter !== 'all' && item.role !== roleFilter) return false
      if (!query) return true

      return [item.name, item.email, item.address]
        .some(field => String(field || '').toLowerCase().includes(query))
    })

    const comparators = {
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      'email-asc': (a, b) => a.email.localeCompare(b.email),
      'email-desc': (a, b) => b.email.localeCompare(a.email),
      'created-desc': (a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
      'created-asc': (a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0)
    }

    return [...filtered].sort(comparators[sortKey])
  }, [users, searchTerm, roleFilter, sortKey])

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('You have been logged out.')
    navigate('/', { replace: true })
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    setIsDeleting(true)

    try {
      await api.delete(`/admin/users/${userToDelete.id}`)
      setUsers(prev => prev.filter(item => item.id !== userToDelete.id))
      toast.success('User deleted successfully.')
      setUserToDelete(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete this user.'))
    } finally {
      setIsDeleting(false)
    }
  }

  const buttonStyle = {
    display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', gap: 7,
    padding: '9px 12px', borderRadius: 9,
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    transition: 'all .2s'
  }

  const renderBody = () => {
    if (status === 'loading') return <TableSkeleton />

    if (status === 'error') {
      return (
        <StateMessage
          icon={AlertTriangle}
          title="Could not load users"
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

    if (users.length === 0) {
      return (
        <StateMessage
          icon={Users}
          title="No users found"
          description="Users who register or are added by an administrator will appear here."
        />
      )
    }

    if (visibleUsers.length === 0) {
      return (
        <StateMessage
          icon={Search}
          title="No matching users"
          description="Try changing your search or filter options."
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 850, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F3EFFB' }}>
                {['ID', 'USER DETAILS', 'ADDRESS', 'ROLE', 'JOINED', 'ACTIONS'].map(item => (
                  <th key={item} style={{
                    padding: '16px 17px', color: '#77718A',
                    fontSize: 10, fontWeight: 800, letterSpacing: 0.7,
                    whiteSpace: 'nowrap'
                  }}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 8) * 0.035 }}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <td style={{ padding: '16px 17px', color: C.muted, fontSize: 12 }}>#{item.id}</td>
                  <td style={{ padding: '14px 17px', minWidth: 205 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 37, height: 37, borderRadius: 12,
                        flexShrink: 0, display: 'grid', placeItems: 'center',
                        background: 'linear-gradient(135deg, #7655D9, #38BDF8)',
                        color: 'white', fontWeight: 800
                      }}>
                        {(item.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: C.charcoal, fontSize: 12, fontWeight: 700, margin: 0 }}>{item.name || '-'}</p>
                        <p style={{ color: C.muted, fontSize: 11, margin: '4px 0 0' }}>{item.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 17px', color: C.muted, fontSize: 12, maxWidth: 180 }}>
                    <span title={item.address} style={{
                      display: 'block', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{item.address || '-'}</span>
                  </td>
                  <td style={{ padding: '16px 17px' }}><RoleBadge role={item.role} /></td>
                  <td style={{ padding: '16px 17px', color: C.muted, fontSize: 12, whiteSpace: 'nowrap' }}>
                    {formatDate(item.createdAt)}
                  </td>
                  <td style={{ padding: '16px 17px' }}>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button
                        onClick={() => setSelectedUser(item)}
                        style={{ ...buttonStyle, color: C.violet, background: '#F0EAFF', border: '1px solid #E2D7FF' }}
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => setUserToDelete(item)}
                        style={{ ...buttonStyle, color: '#D34B4B', background: '#FFF0F0', border: '1px solid #F9DADA' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden" style={{ padding: 14 }}>
          {visibleUsers.map(item => (
            <div key={item.id} style={{
              background: 'white', border: `1px solid ${C.border}`,
              borderRadius: 16, padding: 16, marginBottom: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: C.charcoal, fontWeight: 700, fontSize: 13, margin: 0 }}>{item.name}</p>
                  <p style={{ color: C.muted, fontSize: 11, overflowWrap: 'anywhere' }}>{item.email}</p>
                </div>
                <RoleBadge role={item.role} />
              </div>
              <p style={{ color: C.muted, fontSize: 12 }}>{item.address || '-'}</p>
              <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                <button onClick={() => setSelectedUser(item)} style={{ ...buttonStyle, background: '#F0EAFF', color: C.violet, border: 0 }}>
                  <Eye size={14} /> View
                </button>
                <button onClick={() => setUserToDelete(item)} style={{ ...buttonStyle, background: '#FFF0F0', color: '#D34B4B', border: 0 }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: C.lavender, fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: inherit; }
        .users-main { min-width: 0; flex: 1; }
        .users-sidebar { position: sticky; top: 0; width: 255px; height: 100vh; flex-shrink: 0; display: flex; flex-direction: column; background: linear-gradient(180deg, #241044, #190B30); }
        .users-header { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 30px; background: #FFFFFFDD; backdrop-filter: blur(15px); border-bottom: 1px solid #E9E2F7; }
        .users-content { padding: 30px; }
        .users-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
        .users-search { flex: 1; min-width: 220px; position: relative; }
        .users-search input, .users-select { width: 100%; padding: 12px 14px; border: 1px solid #E5DDF3; border-radius: 11px; background: white; color: #25213A; outline: none; font-size: 12px; }
        .users-search input { padding-left: 40px; }
        .users-search input:focus, .users-select:focus { border-color: #7655D9; box-shadow: 0 0 0 3px #7655D922; }
        .users-select { min-width: 155px; cursor: pointer; }
        .users-menu-button { display: none; }
        .users-overlay { display: none; }
        @media(max-width: 900px) {
          .users-sidebar { display: none; }
          .users-menu-button { display: grid; }
          .users-content { padding: 20px 15px; }
          .users-header { padding: 14px 16px; }
        }
        @media(max-width: 600px) {
          .users-toolbar { flex-direction: column; align-items: stretch; }
          .users-search { min-width: 100%; }
          .users-select { width: 100%; }
        }
      `}</style>

      <aside className="users-sidebar">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: '#17102499' }}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', zIndex: 50, inset: '0 auto 0 0',
                width: 275, display: 'flex', flexDirection: 'column',
                background: `linear-gradient(180deg, ${C.midnight}, #190B30)`
              }}
            >
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{ position: 'absolute', right: 13, top: 13, zIndex: 2, border: 0, background: '#FFFFFF18', color: 'white', borderRadius: 9, padding: 8 }}
              ><X size={19} /></button>
              <SidebarContent onNavigate={() => setIsDrawerOpen(false)} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="users-main">
        <header className="users-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="users-menu-button"
              onClick={() => setIsDrawerOpen(true)}
              style={{ border: 0, background: '#EEE8FF', color: C.violet, padding: 9, borderRadius: 10, cursor: 'pointer' }}
            >
              <Menu size={20} />
            </button>
            <div>
              <p style={{ color: C.charcoal, fontWeight: 800, fontSize: 15, margin: 0 }}>Manage Users</p>
              <p style={{ color: C.muted, fontSize: 10, margin: '3px 0 0' }}>Administration / Users</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: C.charcoal, fontWeight: 700, fontSize: 12, margin: 0 }}>{adminName}</p>
              <p style={{ color: C.violet, fontSize: 10, margin: '4px 0 0' }}>System Administrator</p>
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

        <main className="users-content">
          <motion.div
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
              borderRadius: '50%', background: '#38BDF8',
              opacity: 0.12, filter: 'blur(35px)', right: 20, top: -100
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#B9A5F2', fontSize: 10, fontWeight: 800, letterSpacing: 1.4 }}>
                  <Sparkles size={13} /> USER MANAGEMENT
                </div>
                <h1 style={{ color: 'white', fontSize: 'clamp(23px, 3vw, 30px)', fontWeight: 800, margin: '10px 0 7px' }}>
                  Manage Users
                </h1>
                <p style={{ color: '#D3C9E8', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                  Monitor, organize and manage all platform accounts.
                </p>
              </div>
              <div style={{
                width: 65, height: 65, borderRadius: 20,
                display: 'grid', placeItems: 'center',
                background: '#FFFFFF15', border: '1px solid #FFFFFF30',
                color: C.blue, flexShrink: 0
              }}>
                <Users size={31} />
              </div>
            </div>
          </motion.div>

          {status === 'success' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 15, marginBottom: 25
            }}>
              <SummaryCard label="Total Users" value={summary.total} icon={Users} index={0} gradient="linear-gradient(135deg, #7655D9, #9A75ED)" />
              <SummaryCard label="Administrators" value={summary.admins} icon={Shield} index={1} gradient="linear-gradient(135deg, #49318D, #7655D9)" />
              <SummaryCard label="Normal Users" value={summary.normalUsers} icon={UserRound} index={2} gradient="linear-gradient(135deg, #1685C0, #38BDF8)" />
              <SummaryCard label="Store Owners" value={summary.owners} icon={Store} index={3} gradient="linear-gradient(135deg, #3972A6, #7655D9)" />
            </div>
          )}

          <section style={{
            background: '#FFFFFF', border: `1px solid ${C.border}`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 8px 30px #2410440B'
          }}>
            <div style={{
              padding: '19px 21px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 14
            }}>
              <div>
                <h2 style={{ color: C.charcoal, fontSize: 15, fontWeight: 800, margin: 0 }}>
                  All Platform Users
                </h2>
                <p style={{ color: C.muted, fontSize: 11, margin: '5px 0 0' }}>
                  {status === 'success' ? `${visibleUsers.length} users displayed` : 'Loading user records...'}
                </p>
              </div>
              <div style={{
                background: '#F0EAFF', color: C.violet,
                borderRadius: 9, padding: '7px 11px',
                fontSize: 11, fontWeight: 800
              }}>
                <Users size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {summary.total} TOTAL
              </div>
            </div>

            <div style={{
              padding: '17px 20px', borderBottom: `1px solid ${C.border}`,
              background: '#FCFBFE'
            }}>
              <div className="users-toolbar">
                <div className="users-search">
                  <Search size={16} style={{
                    position: 'absolute', left: 13,
                    top: '50%', transform: 'translateY(-50%)',
                    color: '#9186A5'
                  }} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                    placeholder="Search name, email or address..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Filter size={15} color={C.violet} />
                  <select
                    className="users-select"
                    value={roleFilter}
                    onChange={event => setRoleFilter(event.target.value)}
                    aria-label="Filter by role"
                  >
                    {ROLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <ArrowDownUp size={15} color={C.violet} />
                  <select
                    className="users-select"
                    value={sortKey}
                    onChange={event => setSortKey(event.target.value)}
                    aria-label="Sort users"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {(searchTerm || roleFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    style={{
                      border: '1px solid #E4D9F7', borderRadius: 10,
                      padding: '11px 14px', background: '#F0EAFF',
                      color: C.violet, fontWeight: 700,
                      fontSize: 12, cursor: 'pointer'
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
        {selectedUser && (
          <UserDetailsModal
            key="user-details"
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
        {userToDelete && (
          <DeleteUserModal
            key="delete-user"
            user={userToDelete}
            isDeleting={isDeleting}
            onCancel={() => setUserToDelete(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
