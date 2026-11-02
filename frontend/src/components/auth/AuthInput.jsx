
import { AnimatePresence, motion } from 'framer-motion'

export default function AuthInput({
  id,
  label,
  icon: Icon,
  error,
  rightSlot,
  ...inputProps
}) {
  const errorId = `${id}-error`

  return (
    <div className="w-full space-y-2">

      <label
        htmlFor={id}
        className="block text-sm font-semibold"
        style={{ color: '#25213A' }}
      >
        {label}
      </label>

      <motion.div
        animate={{
          borderColor: error ? '#EF4444' : undefined,
        }}
        className={`group flex min-h-[58px] w-full items-center gap-3 rounded-xl border bg-white px-4 transition-all duration-300 ${
          error
            ? 'border-red-400 focus-within:ring-4 focus-within:ring-red-100'
            : 'border-[#DDD5F0] hover:border-[#7655D9] focus-within:border-[#7655D9] focus-within:ring-4 focus-within:ring-[#7655D9]/10'
        }`}
      >

        {Icon && (
          <Icon
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 transition-colors duration-300 ${
              error
                ? 'text-red-500'
                : 'text-[#817A96] group-focus-within:text-[#7655D9]'
            }`}
          />
        )}

        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent py-3 text-sm font-medium text-[#25213A] outline-none placeholder:font-normal placeholder:text-gray-400"
          {...inputProps}
        />

        {rightSlot && (
          <div className="flex shrink-0 items-center">
            {rightSlot}
          </div>
        )}

      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  )
}
