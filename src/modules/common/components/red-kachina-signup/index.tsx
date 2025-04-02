'use client'

import { useState, useEffect } from 'react'
import { toast } from '@modules/common/components/toast'
import { emailRegex } from '@lib/constants'

const RedKachinaSignup = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Simple CSS to adjust spacing
    const style = document.createElement('style')
    style.textContent = `
      /* Make sure the main content has no top padding */
      #content.pt-\\[110px\\], #content.pt-\\[120px\\], #content.pt-\\[140px\\] {
        padding-top: 80px !important; /* Just enough for header */
      }
      
      /* Reset container styling */
      .red-kachina-container {
        margin-top: 0 !important;
        padding-top: 24px !important;
        padding-bottom: 24px !important;
      }
      
      /* Fix content padding */
      #red-kachina-page .container {
        padding-top: 0 !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast('error', 'Please enter your email address')
      return
    }

    if (!emailRegex.test(email)) {
      toast('error', 'Please enter a valid email address')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast('success', 'Successfully subscribed to Red Kachina updates!')
        setEmail('')
      } else {
        toast('error', data.message || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast('error', 'An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="red-kachina-container w-full bg-[#FDD729] py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold font-anton uppercase mb-6">
          REGISTER FOR RED KACHINA
        </h2>
        <p className="text-lg mb-8 font-latto">
          Be the first to know about new collections and exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className="flex max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="flex-grow px-4 py-3 border border-black/10 rounded-l focus:outline-none focus:ring-2 focus:ring-black/20"
            required
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-6 py-3 font-bold rounded-r hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '...' : '→'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RedKachinaSignup 