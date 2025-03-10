'use client'

import { useCountdown } from '@lib/context/CountdownContext'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

const SeedLineCountdown = () => {
  const { timeLeft } = useCountdown()

  return (
    <div className="mt-12 rounded-lg p-4 relative z-0" style={{ backgroundColor: '#fdd729', minHeight: '120px' }}>
      <div className="relative h-full flex items-center justify-between">
        {/* Left countdown */}
        <div className="flex items-center gap-4">
          <span className="text-black font-bold text-xl">SEED DROP</span>
          <div className="flex gap-2">
            <div className="bg-black text-white px-3 py-2 rounded">
              <span className="font-mono text-xl">{timeLeft.days}</span>
              <span className="text-xs block">DAYS</span>
            </div>
            <div className="bg-black text-white px-3 py-2 rounded">
              <span className="font-mono text-xl">{timeLeft.hours}</span>
              <span className="text-xs block">HRS</span>
            </div>
            <div className="bg-black text-white px-3 py-2 rounded">
              <span className="font-mono text-xl">{timeLeft.minutes}</span>
              <span className="text-xs block">MINS</span>
            </div>
            <div className="bg-black text-white px-3 py-2 rounded">
              <span className="font-mono text-xl">{timeLeft.seconds}</span>
              <span className="text-xs block">SECS</span>
            </div>
          </div>
        </div>

        {/* Centered Red Kachina */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2">
          <span className="text-red-600 font-bold text-5xl whitespace-nowrap" style={{ fontFamily: 'fantasy' }}>
            Red Kachina
          </span>
        </div>

        {/* Right sign up button */}
        <LocalizedClientLink href="/account?mode=register">
          <button className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors text-lg">
            SIGN UP
          </button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SeedLineCountdown 