'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { Button } from '../button'

const AgeVerification = () => {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Only run on client-side
    setMounted(true)
    const hasVerified = localStorage.getItem('age-verified')
    if (!hasVerified) {
      setIsOpen(true)
    }
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate inputs
    if (!day || !month || !year) {
      setError('Please fill in all date fields')
      return
    }

    // Create date object
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    
    // Validate date is real
    if (birthDate.toString() === 'Invalid Date') {
      setError('Please enter a valid date')
      return
    }

    // Check if date is in the future
    if (birthDate > new Date()) {
      setError('Date cannot be in the future')
      return
    }

    // Calculate age
    const age = calculateAge(birthDate)
    
    // Check if user is of legal age (21 for US)
    if (age < 21) {
      window.location.href = 'https://www.google.com'
      return
    }

    // Store verification in localStorage
    localStorage.setItem('age-verified', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <Dialog
      as="div"
      open={isOpen}
      onClose={() => {}}
      className="relative z-[9999]"
    >
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all border-2 border-white">
          <div className="relative w-full h-44 mb-6 flex items-center justify-center">
            <img
              src="/conscious-genetics-logo.png"
              alt="Conscious Genetics Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <Dialog.Title
            as="h3"
            className="text-2xl font-bold leading-6 text-white text-center mb-4"
          >
            Age Verification Required
          </Dialog.Title>

          <div className="mt-2">
            <p className="text-base text-gray-200 text-center mb-6">
              You must be 18 or older to enter this website.
              Please enter your date of birth.
            </p>
          </div>

          <form onSubmit={handleVerify} className="mt-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="month" className="block text-sm font-medium text-gray-300 mb-1">
                  Month
                </label>
                <input
                  type="number"
                  id="month"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="MM"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="day" className="block text-sm font-medium text-gray-300 mb-1">
                  Day
                </label>
                <input
                  type="number"
                  id="day"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="DD"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="YYYY"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-4">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="filled"
              className="w-full !bg-white hover:!bg-gray-100 !text-black font-bold py-3 px-6 rounded-full"
            >
              Enter Site
            </Button>
          </form>

          <p className="mt-6 text-sm text-gray-400 text-center">
            By entering this site you are agreeing to our Terms of Service and Privacy Policy.
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default AgeVerification 