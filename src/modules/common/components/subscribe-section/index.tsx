'use client'

import { useState } from 'react'
import { Container } from '@modules/common/components/container'
import { toast } from '@modules/common/components/toast'

const SubscribeSection = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast('error', 'Please enter your email address')
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
        toast('success', 'Successfully subscribed to newsletter!')
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
    <div className="pt-8 pb-0 relative z-20" style={{ marginBottom: '-1px' }}>
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: 'url("/126.png")', backgroundSize: '700px', imageRendering: 'crisp-edges' }}></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-static"></div>
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.1)] border border-white/20 relative z-10 mb-0">
            <div className="text-center mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-[#8b2a9b] via-[#d67bef] to-[#8b2a9b] bg-clip-text text-transparent">
                Stay in the Loop
              </h2>
              <p className="text-sm sm:text-base text-gray-700 max-w-2xl mx-auto font-latto">
                Get the latest updates on seed drops and growing guides delivered to your inbox.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto relative">
              <div className="flex-grow relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-2.5 rounded-xl text-base border border-transparent bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:border-[#d67bef] transition-all duration-300 placeholder-gray-400 group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  required
                  disabled={isSubmitting}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#d67bef]/30 to-[#8b2a9b]/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              </div>
              <button
                type="submit"
                className="bg-[#8b2a9b] text-white px-8 py-2.5 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#8b2a9b]/30 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group disabled:opacity-70 disabled:hover:transform-none"
                disabled={isSubmitting}
              >
                <span className="relative z-10">{isSubmitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#d67bef] to-[#8b2a9b] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default SubscribeSection 