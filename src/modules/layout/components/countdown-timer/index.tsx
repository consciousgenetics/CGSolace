'use client'

import { useCountdown } from '@lib/context/CountdownContext'
import { useWindowSize } from '@lib/hooks/use-window-size'

export function CountdownTimer() {
  const { timeLeft, isVisible } = useCountdown()
  const { width } = useWindowSize()
  const isMobile = width ? width < 768 : false

  return (
    <div className="w-screen bg-black relative -ml-[50vw] left-1/2 right-1/2 mr-[-50vw]">
      <div className={`w-full transition-all duration-300 ${isVisible ? 'h-12 small:h-14 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
        <div className="flex items-center justify-center text-base small:text-lg text-white h-full px-2 small:px-4 relative w-full">
          {/* For mobile, we stack the elements to ensure the countdown is centered */}
          {isMobile ? (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex items-center justify-center text-center">
                <span className="font-medium tracking-wider text-sm small:text-base text-white">NEXT SEED DROP IN:</span>
                <div className="flex items-center gap-2 small:gap-3 ml-2 small:ml-3">
                  <div className="flex items-center">
                    <span className="font-bold text-white text-base small:text-lg">{timeLeft.days}</span>
                    <span className="ml-0.5 text-white text-sm">d</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-white text-base small:text-lg">{timeLeft.hours}</span>
                    <span className="ml-0.5 text-white text-sm">h</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-white text-base small:text-lg">{timeLeft.minutes}</span>
                    <span className="ml-0.5 text-white text-sm">m</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-white text-base small:text-lg">{timeLeft.seconds}</span>
                    <span className="ml-0.5 text-white text-sm">s</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Desktop layout
            <div className="flex items-center justify-center w-full">
              <span className="font-medium tracking-wider text-base text-white">NEXT SEED DROP IN:</span>
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center">
                  <span className="font-bold text-white text-lg">{timeLeft.days}</span>
                  <span className="ml-0.5 text-white text-sm">d</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-white text-lg">{timeLeft.hours}</span>
                  <span className="ml-0.5 text-white text-sm">h</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-white text-lg">{timeLeft.minutes}</span>
                  <span className="ml-0.5 text-white text-sm">m</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-white text-lg">{timeLeft.seconds}</span>
                  <span className="ml-0.5 text-white text-sm">s</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 