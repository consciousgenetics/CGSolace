'use client'

import { Container } from '@modules/common/components/container'
import { useCountdown } from '@lib/context/CountdownContext'
import { useWindowSize } from '@lib/hooks/use-window-size'

export function CountdownTimer() {
  const { timeLeft, isVisible } = useCountdown()
  const { width } = useWindowSize()
  const isMobile = width ? width < 768 : false

  return (
    <div className={`w-full transition-all duration-300 bg-white ${isVisible ? 'h-12 small:h-14 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
      <div className="flex items-center justify-center text-sm small:text-base medium:text-xl text-black h-full px-2 small:px-4 relative">
        {/* For mobile, we stack the elements to ensure the countdown is centered */}
        {isMobile ? (
          <div className="w-full flex flex-col items-center justify-center">
            <div className="flex items-center justify-center text-center">
              <span className="font-medium tracking-wider text-xs small:text-sm">NEXT SEED DROP IN:</span>
              <div className="flex items-center gap-2 small:gap-3 ml-2 small:ml-3">
                <div className="flex items-center">
                  <span className="font-bold">{timeLeft.days}</span>
                  <span className="ml-0.5">d</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">{timeLeft.hours}</span>
                  <span className="ml-0.5">h</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">{timeLeft.minutes}</span>
                  <span className="ml-0.5">m</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold">{timeLeft.seconds}</span>
                  <span className="ml-0.5">s</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Desktop layout
          <div className="flex items-center">
            <span className="font-medium tracking-wider">NEXT SEED DROP IN:</span>
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center">
                <span className="font-bold">{timeLeft.days}</span>
                <span className="ml-1">d</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold">{timeLeft.hours}</span>
                <span className="ml-1">h</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold">{timeLeft.minutes}</span>
                <span className="ml-1">m</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold">{timeLeft.seconds}</span>
                <span className="ml-1">s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 