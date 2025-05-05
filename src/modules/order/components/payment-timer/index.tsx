'use client'

import { useState, useEffect } from 'react'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'

interface PaymentTimerProps {
  orderId: string
  displayId: string | number
}

const PaymentTimer = ({ orderId, displayId }: PaymentTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(10 * 60) // 10 minutes in seconds
  const [isExpired, setIsExpired] = useState(false)
  const [isTransferred, setIsTransferred] = useState(false)

  // Check for stored expiration time and transfer status when component mounts
  useEffect(() => {
    const orderKey = `order_expiry_${orderId}`
    const storedData = localStorage.getItem(orderKey)
    
    if (storedData) {
      const { expiryTime, transferred } = JSON.parse(storedData)
      
      // If user has already marked as transferred
      if (transferred) {
        setIsTransferred(true)
        return
      }
      
      const now = new Date().getTime()
      const timeRemaining = Math.floor((expiryTime - now) / 1000)
      
      if (timeRemaining <= 0) {
        setIsExpired(true)
        setTimeLeft(0)
      } else {
        setTimeLeft(timeRemaining)
      }
    } else {
      // Set a new expiration time if none exists
      const expiryTime = new Date().getTime() + (10 * 60 * 1000) // 10 minutes from now
      localStorage.setItem(orderKey, JSON.stringify({
        expiryTime,
        orderId,
        displayId,
        transferred: false
      }))
    }
  }, [orderId, displayId])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || isTransferred) {
      isTransferred ? setIsExpired(false) : setIsExpired(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearInterval(timer)
          setIsExpired(true)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isTransferred])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress bar percentage
  const progressPercentage = Math.max(0, (timeLeft / (10 * 60)) * 100)

  // Handle transfer button click
  const handleTransferClick = () => {
    setIsTransferred(true)
    
    // Update localStorage to remember transfer status
    const orderKey = `order_expiry_${orderId}`
    const storedData = localStorage.getItem(orderKey)
    
    if (storedData) {
      const data = JSON.parse(storedData)
      localStorage.setItem(orderKey, JSON.stringify({
        ...data,
        transferred: true
      }))
    }
  }

  if (isTransferred) {
    return (
      <Box className="bg-green-50 border border-green-400 rounded-lg p-4 my-2 w-full max-w-lg mx-auto shadow-sm">
        <Box className="flex items-center justify-center text-center p-2">
          <Box>
            <Heading as="h3" className="text-base font-semibold text-green-800 mb-1">
              Thank You For Your Payment
            </Heading>
            <Text className="text-green-700 text-sm">
              We've received your payment confirmation for order #{displayId}.
              Our team will process your order shortly.
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }

  if (isExpired) {
    return (
      <Box className="bg-red-50 border border-red-300 rounded-lg p-4 my-2 w-full max-w-lg mx-auto shadow-sm">
        <Box className="flex items-center justify-center text-center p-2">
          <Box>
            <Heading as="h3" className="text-base font-semibold text-red-800 mb-1">
              Payment Time Expired
            </Heading>
            <Text className="text-red-700 text-sm">
              Hello, time has expired. Please place another order if you wish to make this purchase.
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="bg-white border border-purple-400 rounded-lg p-4 my-2 w-full max-w-lg mx-auto shadow-sm">
      <Box className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Box className="text-center sm:text-left">
          <Heading as="h3" className="text-base font-semibold text-purple-800">
            Complete Payment Within
          </Heading>
          
          <Text className="text-2xl font-mono font-bold text-purple-600">
            {formatTime(timeLeft)}
          </Text>
        </Box>
        
        <Box className="w-full sm:w-2/3">
          {/* Progress bar */}
          <Box className="w-full bg-gray-200 rounded-full h-3">
            <Box 
              className="bg-purple-600 h-3 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </Box>
          
          <Text className="text-gray-600 text-xs mt-1 text-center">
            Please complete your bank transfer before timer expires
          </Text>
        </Box>
      </Box>
      
      {/* Transfer confirmation button */}
      <Box className="mt-3 text-center">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          onClick={handleTransferClick}
        >
          I've Transferred the Money
        </button>
        <Text className="text-xs text-gray-500 mt-1">
          Click this button after you've completed your bank transfer
        </Text>
      </Box>
    </Box>
  )
}

export default PaymentTimer 