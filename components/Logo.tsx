'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  variant?: 'light' | 'dark'
}

export default function Logo({ size = 'md', showText = true, className = '', variant = 'light' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-base' },
    md: { icon: 40, text: 'text-lg' },
    lg: { icon: 56, text: 'text-3xl' }
  }

  const { icon: iconSize, text: textSize } = sizes[size]
  const textColor = variant === 'dark' ? 'text-white' : 'text-black'
  const redColor = 'text-red-600'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className="relative flex items-center justify-center" style={{ width: iconSize * 1.2, height: iconSize }}>
        {/* Checkmark in rounded square (left) */}
        <div className="absolute left-0 bg-black rounded-md flex items-center justify-center" style={{ width: iconSize * 0.4, height: iconSize * 0.4 }}>
          <svg 
            viewBox="0 0 16 16" 
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 8l2 2 6-6" />
          </svg>
        </div>

        {/* Worker silhouette with red hard hat (center) */}
        <div className="absolute" style={{ left: iconSize * 0.35, width: iconSize * 0.55, height: iconSize }}>
          {/* Hard hat - red */}
          <svg viewBox="0 0 50 50" className="absolute" style={{ width: iconSize * 0.55, height: iconSize * 0.35, top: 0, left: 0 }}>
            <path
              d="M10 15 Q25 10 40 15 L37 25 Q25 22 13 25 Z"
              fill="#dc2626"
            />
          </svg>
          {/* Head and shoulders - black */}
          <svg viewBox="0 0 50 50" className="absolute" style={{ width: iconSize * 0.55, height: iconSize }}>
            {/* Head */}
            <circle cx="25" cy="22" r="9" fill={variant === 'dark' ? '#ffffff' : '#000000'} />
            {/* Shoulders */}
            <path
              d="M12 32 Q25 30 38 32 L35 40 Q25 38 15 40 Z"
              fill={variant === 'dark' ? '#ffffff' : '#000000'}
            />
          </svg>
        </div>

        {/* ECG/Pulse graph (right) */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2" style={{ width: iconSize * 0.55, height: iconSize * 0.45 }}>
          <svg viewBox="0 0 50 25" className="w-full h-full" style={{ color: '#dc2626' }}>
            <path
              d="M0 18 L6 18 L10 6 L14 18 L18 10 L22 18 L26 14 L30 18 L34 12 L38 18 L50 18"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className={`flex items-baseline ${textColor}`}>
          <span className={`font-bold ${textSize}`}>KBT</span>
          <span className={`font-bold ${textSize} ${redColor}`}>Pulse</span>
        </div>
      )}
    </div>
  )
}
