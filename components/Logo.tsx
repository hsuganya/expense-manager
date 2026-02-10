import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizeMap = {
  sm: { icon: 'h-6 w-6', text: 'text-sm' },
  md: { icon: 'h-8 w-8', text: 'text-base' },
  lg: { icon: 'h-12 w-12', text: 'text-xl' },
}

export default function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative flex items-center justify-center', sizes.icon)}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* Wallet base with gradient effect */}
          <rect
            x="3"
            y="7"
            width="18"
            height="11"
            rx="2"
            fill="url(#walletGradient)"
            className="text-primary"
          />
          {/* Wallet outline */}
          <rect
            x="3"
            y="7"
            width="18"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-primary"
          />
          {/* Money symbol (₹) */}
          <text
            x="12"
            y="14"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill="currentColor"
            className="text-primary-foreground"
          >
            ₹
          </text>
          {/* Wallet flap/cover */}
          <path
            d="M3 8C3 7.44772 3.44772 7 4 7H20C20.5523 7 21 7.44772 21 8V9.5H3V8Z"
            fill="currentColor"
            className="text-primary"
            opacity="0.4"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={cn('font-bold text-foreground', sizes.text)}>
          Expense Manager
        </span>
      )}
    </div>
  )
}

