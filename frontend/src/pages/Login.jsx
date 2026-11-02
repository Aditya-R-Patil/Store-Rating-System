
import { motion } from 'framer-motion'
import BrandShowcase from '../components/auth/BrandShowcase.jsx'
import LoginForm from '../components/auth/LoginForm.jsx'

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen flex-col lg:flex-row"
      style={{ backgroundColor: '#F5F3FF' }}
    >
      <BrandShowcase />

      <section
        className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-10 sm:px-10 lg:px-14"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(118,85,217,0.14), transparent 35%), radial-gradient(circle at bottom left, rgba(56,189,248,0.13), transparent 35%), #F5F3FF',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(56,189,248,0.17)' }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-0 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(118,85,217,0.15)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-3xl border p-7 backdrop-blur-xl sm:p-10"
          style={{
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderColor: 'rgba(118,85,217,0.18)',
            boxShadow: '0 25px 70px rgba(36,16,68,0.14)',
          }}
        >
          <div className="mb-8">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #241044, #7655D9)',
              }}
            >
              <span className="text-xl font-bold text-white">SR</span>
            </div>

            <h2
              className="text-3xl font-bold leading-tight"
              style={{ color: '#25213A' }}
            >
              Welcome Back
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Sign in to continue rating and exploring stores.
            </p>
          </div>

          <LoginForm />
        </motion.div>
      </section>
    </main>
  )
}
