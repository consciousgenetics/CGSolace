'use client'

import { Container } from '@modules/common/components/container'
import { Button } from '@modules/common/components/button'
import { useCountdown } from '@lib/context/CountdownContext'

export function CountdownTimer() {
  const { timeLeft, isVisible } = useCountdown()

  return (
    <div className={`w-full transition-all duration-300 bg-white ${isVisible ? 'h-12 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
      <div className="flex items-center justify-center text-xl text-black h-full px-4 relative">
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
        <Button
          variant="ghost"
          className="text-black hover:text-black/80 h-full py-0 px-4 text-xl absolute right-4"
          onClick={() => window.location.href = '/subscribe'}
        >
          Subscribe
        </Button>
      </div>
    </div>
  )
} 