'use client'

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface ProductGridItemProps {
  delay: number
  type?: 'product' | 'image'
  title?: string
  price?: string
  priceLabel?: string
  tagText?: string
  tagColor?: 'purple' | 'amber'
  description?: string
  tagItems?: string[]
  bonusItems?: string[]
  listItems?: string[]
  buttonLink?: string
  buttonColor?: 'purple' | 'amber'
  className?: string
  imageSrc?: string
  imageAlt?: string
  imageTitle?: string
  imageTag?: string
  backgroundColor?: 'purple' | 'amber'
}

export default function ProductGridItem({
  delay,
  type = 'product',
  title,
  price,
  priceLabel,
  tagText,
  tagColor = 'purple',
  description,
  tagItems,
  bonusItems,
  listItems,
  buttonLink,
  buttonColor = 'purple',
  className = '',
  imageSrc,
  imageAlt,
  imageTitle,
  imageTag,
  backgroundColor = 'purple',
}: ProductGridItemProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px"
  })

  // Background color styles based on color prop
  const getBgStyle = () => {
    if (type === 'image') {
      return backgroundColor === 'purple' 
        ? { background: "linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(76, 29, 149, 0.9) 100%)" }
        : { background: "linear-gradient(135deg, rgba(217, 119, 6, 0.9) 0%, rgba(180, 83, 9, 0.9) 100%)" };
    }
    
    return {
      background: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
    };
  };
  
  // Get tag color classes
  const getTagClasses = () => {
    return tagColor === 'purple'
      ? "text-purple-200 bg-purple-900/70"
      : "text-amber-200 bg-amber-900/70";
  };
  
  // Get title gradient classes
  const getTitleGradient = () => {
    return tagColor === 'purple'
      ? "from-purple-400 via-indigo-300 to-purple-300"
      : "from-amber-300 via-yellow-200 to-amber-300";
  };
  
  // Get price text color
  const getPriceColor = () => {
    return tagColor === 'purple'
      ? "text-purple-200"
      : "text-yellow-200";
  };
  
  // Get price label color
  const getPriceLabelColor = () => {
    return tagColor === 'purple'
      ? "text-purple-300"
      : "text-yellow-300";
  };
  
  // Get button gradient classes
  const getButtonGradient = () => {
    return buttonColor === 'purple'
      ? "from-purple-600 to-indigo-600" 
      : "from-amber-500 to-yellow-500";
  };
  
  // Get button text color
  const getButtonTextColor = () => {
    return buttonColor === 'purple'
      ? "text-white"
      : "text-black";
  };
  
  // Get check mark background color
  const getCheckBgColor = () => {
    return buttonColor === 'purple'
      ? "bg-purple-900/70 text-purple-200"
      : "bg-amber-900/70 text-amber-200";
  };

  // Get background class for image items
  const getBgClass = () => {
    return backgroundColor === 'purple'
      ? "bg-gradient-to-br from-purple-600/90 to-purple-900/90"
      : "bg-gradient-to-br from-amber-500/90 to-amber-800/90";
  };

  // Image grid item
  if (type === 'image') {
    return (
      <motion.div
        ref={ref}
        className={`${className}`}
        initial={{ opacity: 0, y: 60 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      >
        <motion.div 
          className="relative h-[400px] small:h-[60vh] rounded-[40px] overflow-hidden shadow-2xl hover:shadow-[0_25px_60px_-15px_rgba(119,43,143,0.5)] transition-all duration-700"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 ${getBgClass()} mix-blend-multiply`} />
            <Image
              src="/126.png"
              alt="Background pattern"
              fill
              className="object-cover opacity-40"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-b from-pink-500/20 to-purple-800/0 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-gradient-to-t from-indigo-500/20 to-purple-800/0 rounded-full blur-3xl transform -translate-x-10 translate-y-10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <motion.div 
              className="relative w-[85%] h-[85%] rounded-3xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.8 }}
            >
              <Image
                src={imageSrc || "/placeholder.jpg"}
                alt={imageAlt || "Product image"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 70vw, 35vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <motion.span 
                  className={`inline-block px-3 py-1 text-xs font-medium ${getTagClasses()} rounded-full mb-3`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.4 }}
                >
                  {imageTag || "Collection"}
                </motion.span>
                <motion.h3 
                  className="text-xl font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.5 }}
                >
                  {imageTitle || "Product Image"}
                </motion.h3>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Product grid item
  return (
    <motion.div
      ref={ref}
      className={`${className}`}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <motion.div
        className="relative p-6 small:p-8 flex flex-col justify-between h-[500px] small:h-[60vh] rounded-[40px] overflow-hidden shadow-2xl hover:shadow-[0_25px_60px_-15px_rgba(119,43,143,0.5)] transition-all duration-700"
        whileHover={{ scale: 1.02, y: -5 }}
        style={getBgStyle()}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-indigo-400/20 to-purple-900/20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gradient-to-tl from-pink-400/30 to-purple-600/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-indigo-400/20 to-purple-600/10 rounded-full blur-3xl transform -translate-x-10 translate-y-10" />
          <Image
            src="/126.png"
            alt="Background pattern"
            fill
            className="object-cover opacity-40"
            sizes="(max-width: 640px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="space-y-4 small:space-y-5">
            <div>
              <motion.span 
                className={`inline-block px-3 py-1 text-xs font-semibold ${getTagClasses()} rounded-full mb-2`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.1 }}
              >
                {tagText || "Collection"}
              </motion.span>
              <motion.h2 
                className={`text-2xl small:text-3xl large:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getTitleGradient()} uppercase tracking-tight break-words`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.2, duration: 0.8 }}
              >
                {title}
              </motion.h2>
            </div>
            <motion.p 
              className={`text-xl small:text-2xl font-bold ${getPriceColor()} flex items-baseline`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {price} <span className={`text-sm ${getPriceLabelColor()} ml-2`}>{priceLabel}</span>
            </motion.p>
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
            >
              {description && (
                <p className="text-sm small:text-base text-gray-300">
                  {description}
                </p>
              )}
              
              {/* Tags for items */}
              {tagItems && tagItems.length > 0 && (
                <div className="flex flex-wrap gap-1 small:gap-2">
                  {tagItems.map((item, index) => (
                    <span key={index} className={`px-2 py-1 ${getTagClasses()} text-xs rounded-md`}>
                      {item}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Bonus items with checkmarks */}
              {bonusItems && bonusItems.length > 0 && (
                <>
                  <p className={`text-sm small:text-base font-semibold ${getPriceLabelColor()} mt-2`}>
                    Plus Bonus Specials:
                  </p>
                  <ul className="space-y-1 small:space-y-2">
                    {bonusItems.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs small:text-sm text-gray-300">
                        <span className={`flex items-center justify-center w-4 h-4 rounded-full ${getCheckBgColor()} text-xs`}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              {/* Regular list items with checkmarks */}
              {listItems && listItems.length > 0 && (
                <ul className="space-y-3">
                  {listItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full ${getCheckBgColor()}`}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
          
          {/* Button */}
          {buttonLink && (
            <motion.div 
              className="mt-4 relative"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${getButtonGradient()} rounded-full blur-md opacity-70 transform translate-y-1`}></div>
                <Link
                  href={buttonLink}
                  className={`relative flex items-center justify-center gap-1 bg-gradient-to-r ${getButtonGradient()} ${getButtonTextColor()} px-6 py-3 rounded-full font-semibold uppercase inline-block hover:shadow-xl shadow-md transition-all duration-300 text-sm w-full`}
                >
                  <span>SHOP NOW</span>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.33337 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 3.33337L12.6667 8.00004L8 12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 