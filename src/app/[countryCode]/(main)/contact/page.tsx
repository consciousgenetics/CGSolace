'use client'

import { useState } from 'react'
import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
      
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your message. We will get back to you soon!',
      })
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <>
      <style jsx global>{`
        .contact-form input,
        .contact-form textarea {
          color: white !important;
          caret-color: white !important;
        }
        .contact-form input::placeholder,
        .contact-form textarea::placeholder {
          color: #9ca3af !important;
        }
        .contact-form input:-webkit-autofill,
        .contact-form textarea:-webkit-autofill {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px #111827 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        /* Fix contact page layout to prevent white space */
        #content:has(.contact-page-container) {
          padding-top: 0 !important;
        }
        
        .contact-page-container {
          margin-top: 0 !important;
          padding-top: 8rem !important; /* Space for fixed header */
        }
        
        @media (min-width: 640px) {
          .contact-page-container {
            padding-top: 9rem !important;
          }
        }
        
        @media (min-width: 768px) {
          .contact-page-container {
            padding-top: 10rem !important;
          }
        }
      `}</style>
      
      <div className="contact-page-container flex flex-col min-h-screen py-6 sm:py-8 md:py-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-repeat opacity-100" style={{ backgroundImage: 'url("/126-wide.png")', backgroundSize: '800px' }}></div>
        
        <Container>
          <div className="max-w-4xl mx-auto w-full relative">
            <div className="text-center mb-8 sm:mb-12">
              <Text className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">Contact Us</Text>
              <Text className="text-white text-base sm:text-lg max-w-2xl mx-auto">
                Have a question or feedback? We'd love to hear from you. Our team will get back to you as soon as possible.
              </Text>
            </div>

            <div className="bg-black rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl backdrop-blur-sm bg-opacity-90">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block text-sm font-medium text-white mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 caret-white"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium text-white mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 caret-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="subject" 
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 caret-white"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 resize-none text-white placeholder-gray-400 caret-white"
                    placeholder="Your message here..."
                  />
                </div>

                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-lg ${
                      submitStatus.type === 'success'
                        ? 'bg-green-900 text-green-100'
                        : 'bg-red-900 text-red-100'
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <div className="flex justify-center sm:justify-end mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 sm:px-12 py-3 sm:py-4 bg-white text-black font-bold rounded-lg 
                      hover:bg-gray-100 transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center
                      text-base sm:text-lg
                      min-w-[200px]
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
} 