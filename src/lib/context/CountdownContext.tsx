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
}

const CountdownContext = createContext<CountdownContextType | undefined>(undefined)

export function CountdownProvider({ children }: { children: ReactNode }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: '003',
    hours: '22',
    minutes: '29',
    seconds: '57'
  })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let secs = parseInt(prev.seconds)
        let mins = parseInt(prev.minutes)
        let hrs = parseInt(prev.hours)
        let days = parseInt(prev.days)

        secs--
        if (secs < 0) {
          secs = 59
          mins--
          if (mins < 0) {
            mins = 59
            hrs--
            if (hrs < 0) {
              hrs = 23
              days--
              if (days < 0) {
                // Reset to initial time or handle end of countdown
                return {
                  days: '003',
                  hours: '22',
                  minutes: '29',
                  seconds: '57'
                }
              }
            }
          }
        }

        return {
          days: days.toString().padStart(3, '0'),
          hours: hrs.toString().padStart(2, '0'),
          minutes: mins.toString().padStart(2, '0'),
          seconds: secs.toString().padStart(2, '0')
        }
      })
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
    <CountdownContext.Provider value={{ timeLeft, isVisible }}>
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