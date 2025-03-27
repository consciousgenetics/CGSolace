'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCountdown } from '@lib/context/CountdownContext'

// Client-side component to render the countdown
const ClientCountdownDisplay = () => {
  const { timeLeft, hasCompleted } = useCountdown()
  const router = useRouter()
  
  // If countdown is complete, refresh the page to show products
  React.useEffect(() => {
    if (hasCompleted) {
      router.refresh()
    }
  }, [hasCompleted, router])
  
  return (
    <div className="w-full py-10 flex flex-col items-center justify-center">
      
      
      <div className="max-w-xl w-full p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-xl font-semibold mb-4 text-center">Red Kachina Line Release Countdown:</h4>
        
        {/* Custom countdown display */}
        <div className="flex justify-center items-center gap-6 py-4">
          <div className="flex flex-col items-center">
            <div className="bg-black text-white text-2xl font-bold rounded px-4 py-3 min-w-[60px] text-center">
              {timeLeft.days}
            </div>
            <span className="text-sm mt-1">DAYS</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-black text-white text-2xl font-bold rounded px-4 py-3 min-w-[60px] text-center">
              {timeLeft.hours}
            </div>
            <span className="text-sm mt-1">HOURS</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-black text-white text-2xl font-bold rounded px-4 py-3 min-w-[60px] text-center">
              {timeLeft.minutes}
            </div>
            <span className="text-sm mt-1">MINUTES</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-black text-white text-2xl font-bold rounded px-4 py-3 min-w-[60px] text-center">
              {timeLeft.seconds}
            </div>
            <span className="text-sm mt-1">SECONDS</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientCountdownDisplay 