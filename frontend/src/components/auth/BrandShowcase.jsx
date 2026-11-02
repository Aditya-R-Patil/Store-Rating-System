
import { motion } from 'framer-motion'
import { Star, Store, ShieldCheck, Users } from 'lucide-react'

const PARTICLES = [
  { top: '8%', left: '12%', size: 4 },
  { top: '18%', left: '78%', size: 3 },
  { top: '32%', left: '40%', size: 2 },
  { top: '46%', left: '8%', size: 3 },
  { top: '58%', left: '88%', size: 4 },
  { top: '72%', left: '30%', size: 2 },
  { top: '84%', left: '66%', size: 3 },
]

const FLOATING_STARS = [
  { top: '14%', left: '62%', size: 25, duration: 5 },
  { top: '38%', left: '82%', size: 19, duration: 6 },
  { top: '56%', left: '14%', size: 22, duration: 5.5 },
  { top: '70%', left: '48%', size: 17, duration: 7 },
]

const HEADLINE_WORDS = ['Discover.', 'Rate.', 'Experience.']

const headlineContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const headlineWord = {
  hidden: { opacity: 0, y: 25, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

export default function BrandShowcase() {
  return (
    <section
      className="relative flex min-h-[360px] flex-col justify-between overflow-hidden p-7 text-white sm:p-10 lg:min-h-screen lg:w-1/2 lg:p-14"
      style={{
        background:
          'linear-gradient(145deg, #241044 0%, #321B62 52%, #172D58 100%)',
      }}
    >
      {/* Background glow */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(118,85,217,0.4)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute -bottom-32 right-0 h-96 w-96 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(56,189,248,0.22)' }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Decorative shapes */}
      <motion.div
        aria-hidden="true"
        className="absolute right-[12%] top-[16%] h-24 w-24 rotate-12 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-sm"
        animate={{ y: [0, -18, 0], rotate: [12, 20, 12] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute bottom-[30%] left-[6%] h-14 w-14 rounded-full border border-sky-300/30"
        animate={{ y: [0, 14, 0], x: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Particles */}
      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="absolute rounded-full bg-white"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{
            duration: 6 + index,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        />
      ))}

      {/* Floating stars */}
      {FLOATING_STARS.map((star, index) => (
        <motion.div
          key={index}
          aria-hidden="true"
          className="absolute"
          style={{ top: star.top, left: star.left }}
          animate={{ y: [0, -15, 0], rotate: [0, 12, 0] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: index * 0.4,
          }}
        >
          <Star
            style={{ width: star.size, height: star.size }}
            className="fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"
          />
        </motion.div>
      ))}

      {/* Brand logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 inline-flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl"
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #7655D9, #38BDF8)',
          }}
        >
          <Store className="h-5 w-5 text-white" />
        </span>

        <div>
          <p className="text-sm font-bold tracking-wide text-white">
            Store Rating
          </p>
          <p className="text-xs text-purple-100/75">
            System
          </p>
        </div>
      </motion.div>

      {/* Main heading */}
      <div className="relative z-10 mt-12 max-w-xl lg:mt-0">
        <motion.div
          variants={headlineContainer}
          initial="hidden"
          animate="visible"
          className="text-4xl font-extrabold leading-[1.2] sm:text-5xl lg:text-6xl"
        >
          {HEADLINE_WORDS.map((word, index) => (
            <motion.span
              key={word}
              variants={headlineWord}
              className="block"
              style={
                index === 2
                  ? {
                      background:
                        'linear-gradient(90deg, #38BDF8, #FFFFFF, #A78BFA)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }
                  : { color: '#FFFFFF' }
              }
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 max-w-md text-sm leading-7 text-purple-100/85 sm:text-base"
        >
          Find trusted local stores, read honest reviews, and share your own
          experiences. Every rating helps the community make better choices.
        </motion.p>

        {/* Features */}
        <div className="mt-7 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/90 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-sky-300" />
            Trusted Reviews
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/90 backdrop-blur-md">
            <Users className="h-4 w-4 text-sky-300" />
            Community Driven
          </div>
        </div>
      </div>

      {/* Rating showcase */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1 }}
        className="relative z-10 mt-10 hidden max-w-md lg:block"
      >
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Community Ratings
              </p>
              <p className="mt-1 text-xs text-purple-100/70">
                Helping people choose better stores
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-amber-400/15 px-3 py-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">
                Rate 1–5
              </span>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #7655D9, #38BDF8)',
              }}
              initial={{ width: 0 }}
              animate={{ width: '90%' }}
              transition={{ duration: 1.4, delay: 1.3 }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
