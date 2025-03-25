'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
            scale: {
              type: "spring",
              damping: 5,
              stiffness: 100,
              restDelta: 0.001
            }
          }}
        >
          <Image
            src="/conscious-genetics-logo.png"
            alt="Conscious Genetics"
            width={300}
            height={150}
            className="animate-pulse"
            priority
            unoptimized
          />
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-1 bg-gradient-to-r from-purple-600 via-amber-400 to-purple-600 mt-6 rounded-full"
        />
      </div>
    </div>
  )
}

export default Loading 