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
    <div className="bg-white py-8 relative z-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-black/5">
            <div className="text-center mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Stay in the Loop
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
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
                  className="w-full px-6 py-2.5 rounded-xl text-base border border-transparent bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:border-amber-500 transition-all duration-300 placeholder-gray-400 group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  required
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-100/50 to-amber-50/50 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              </div>
              <button
                type="submit"
                className="bg-black text-white px-8 py-2.5 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-black/10 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
              >
                <span className="relative z-10">SUBSCRIBE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default SubscribeSection 