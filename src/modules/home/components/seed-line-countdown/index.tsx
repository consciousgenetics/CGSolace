'use client'

import Image from 'next/image'
import { useCountdown } from '@lib/context/CountdownContext'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const SeedLineCountdown = () => {
  const { timeLeft } = useCountdown()
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, {
    once: true,
    margin: "-100px 0px"
  })

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  }

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mt-12 rounded-lg p-4 relative z-0 overflow-hidden" 
      style={{ minHeight: '120px' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/cgcountdown.png"
          alt="Conscious Genetics Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center gap-8">
        {/* Countdown section */}
        <div className="flex flex-col items-center gap-4">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white font-bold text-xl font-latto"
          >
            SEED DROP
          </motion.span>
          <div className="flex gap-2">
            {[
              { value: timeLeft.days, label: 'DAYS' },
              { value: timeLeft.hours, label: 'HRS' },
              { value: timeLeft.minutes, label: 'MINS' },
              { value: timeLeft.seconds, label: 'SECS' }
            ].map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={cardVariants}
                className="bg-black/80 text-white px-3 py-2 rounded backdrop-blur-sm"
              >
                <span className="font-mono text-xl font-latto">{item.value}</span>
                <span className="text-xs block font-latto">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sign up button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full flex justify-center"
        >
          <LocalizedClientLink href="/account?mode=register" className="w-full flex justify-center">
            <button className="bg-black/80 text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition-colors text-lg backdrop-blur-sm font-latto">
              SIGN UP
            </button>
          </LocalizedClientLink>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SeedLineCountdown 