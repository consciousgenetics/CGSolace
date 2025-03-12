'use client'

import Image from 'next/image'
import { useCountdown } from '@lib/context/CountdownContext'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

const SeedLineCountdown = () => {
  const { timeLeft } = useCountdown()

  return (
    <div className="mt-12 rounded-lg p-4 relative z-0 overflow-hidden" style={{ minHeight: '120px' }}>
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/cgcountdown.png"
          alt="Conscious Genetics Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
        {/* Left countdown */}
        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
          <span className="text-white font-bold text-xl">SEED DROP</span>
          <div className="flex gap-2">
            <div className="bg-black/80 text-white px-3 py-2 rounded backdrop-blur-sm">
              <span className="font-mono text-xl">{timeLeft.days}</span>
              <span className="text-xs block">DAYS</span>
            </div>
            <div className="bg-black/80 text-white px-3 py-2 rounded backdrop-blur-sm">
              <span className="font-mono text-xl">{timeLeft.hours}</span>
              <span className="text-xs block">HRS</span>
            </div>
            <div className="bg-black/80 text-white px-3 py-2 rounded backdrop-blur-sm">
              <span className="font-mono text-xl">{timeLeft.minutes}</span>
              <span className="text-xs block">MINS</span>
            </div>
            <div className="bg-black/80 text-white px-3 py-2 rounded backdrop-blur-sm">
              <span className="font-mono text-xl">{timeLeft.seconds}</span>
              <span className="text-xs block">SECS</span>
            </div>
          </div>
        </div>

        {/* Right sign up button */}
        <LocalizedClientLink href="/account?mode=register" className="md:ml-auto pl-[calc(33.3%-50px)] md:pl-0">
          <button className="bg-black/80 text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition-colors text-lg backdrop-blur-sm">
            SIGN UP
          </button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SeedLineCountdown 