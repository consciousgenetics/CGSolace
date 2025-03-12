'use client'

import { useState } from 'react'
import { Container } from '@modules/common/components/container'

const SubscribeSection = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement email subscription logic
    console.log('Email submitted:', email)
    setEmail('')
  }

  return (
    <div className="bg-[#fdd729] py-16 relative z-20">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-8">Subscribe to get updates on new releases and exclusive offers</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-grow px-6 py-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-black/90 transition-colors"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </Container>
    </div>
  )
}

export default SubscribeSection 