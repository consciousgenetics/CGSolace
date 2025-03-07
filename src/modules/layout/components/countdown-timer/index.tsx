'use client'

import { useEffect, useState } from 'react'
import { Container } from '@modules/common/components/container'
import { Button } from '@modules/common/components/button'

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Set your target date here (example: 7 days from now)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 7)

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    // Update timer every second
    const timer = setInterval(calculateTimeLeft, 1000)

    // Handle scroll event
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)

    // Cleanup
    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className={`w-full transition-all duration-300 ${isVisible ? 'h-6 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
      <div className="flex items-center justify-between text-xs text-black h-full">
        <div className="flex items-center">
          <span className="font-medium tracking-wider">NEXT SEED DROP IN:</span>
          <div className="flex items-center gap-2 ml-2">
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
        <Button
          variant="ghost"
          className="text-black hover:text-black/80 h-full py-0 px-4 text-xs"
          onClick={() => window.location.href = '/subscribe'}
        >
          Subscribe
        </Button>
      </div>
    </div>
  )
} 