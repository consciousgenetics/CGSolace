'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface TimeLeft {
  days: string
  hours: string
  minutes: string
  seconds: string
}

interface CountdownContextType {
  timeLeft: TimeLeft
  isVisible: boolean
  hasCompleted: boolean
}

const CountdownContext = createContext<CountdownContextType | undefined>(undefined)

export function CountdownProvider({ children }: { children: ReactNode }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  })
  const [isVisible, setIsVisible] = useState(true)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    // Set target date to May 1st, 2025
    const targetDate = new Date('2025-05-01T00:00:00').getTime()
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = targetDate - now
      
      // If we've reached the target date
      if (difference <= 0) {
        setHasCompleted(true)
        return {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00'
        }
      }
      
      // Calculate remaining time
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      return {
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      }
    }
    
    // Set initial time left
    setTimeLeft(calculateTimeLeft())
    
    // Update time every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

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

    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <CountdownContext.Provider value={{ timeLeft, isVisible, hasCompleted }}>
      {children}
    </CountdownContext.Provider>
  )
}

export function useCountdown() {
  const context = useContext(CountdownContext)
  if (context === undefined) {
    throw new Error('useCountdown must be used within a CountdownProvider')
  }
  return context
} 