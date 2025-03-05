'use client'

import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'

interface ReviewCardProps {
  name: string
  review: string
  location: string
}

const ReviewCard = ({ name, review, location }: ReviewCardProps) => {
  return (
    <Box className="bg-white rounded-[30px] p-6 small:p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl h-full w-full min-h-[300px] small:min-h-[360px] justify-between mb-8 small:mb-0"
         style={{
           transform: "perspective(1000px) rotateX(2deg)",
           transformStyle: "preserve-3d",
           boxShadow: "0 15px 25px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.1)"
         }}>
      {/* Enhanced 3D Star Rating */}
      <div className="flex mb-4 small:mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative mx-1 small:mx-1.5 transform hover:scale-125 transition-transform duration-300">
            <svg
              className="w-7 h-7 small:w-9 small:h-9 text-orange-500 filter drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{
                filter: "drop-shadow(0 0 6px rgba(255, 145, 20, 0.7))"
              }}
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <div className="absolute inset-0 bg-amber-500 opacity-40 blur-md rounded-full" 
                 style={{ transform: 'scale(0.9) translateZ(0)' }}></div>
          </div>
        ))}
      </div>
      
      <div className="flex-1 flex flex-col justify-center mb-4">
        <Text className="text-xl small:text-2xl font-['Anton'] mb-3 small:mb-5 transform transition-all duration-300 hover:scale-105 text-black">{name}</Text>
        <Text className="text-gray-600 mb-4 small:mb-6 text-base small:text-lg leading-relaxed">{review}</Text>
      </div>
      
      <div className="mt-auto">
        <Text className="text-lg small:text-xl font-['Anton'] text-black transform hover:translate-y-[-2px] transition-transform duration-300">{location}</Text>
        
        {/* 3D effect bottom accent */}
        <div className="w-24 h-1 bg-black mt-4 mx-auto rounded-full shadow-md transform transition-all duration-300 hover:scale-110"></div>
      </div>
    </Box>
  )
}

export function ReviewSection() {
  const reviews = [
    {
      name: "JOHN DOE",
      review: "Lorem ipsum, Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates, deserunt.",
      location: "LONDON UK"
    },
    {
      name: "JOHN DOE",
      review: "Lorem ipsum, Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates, deserunt.",
      location: "LONDON UK"
    },
    {
      name: "JOHN DOE",
      review: "Lorem ipsum, Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates, deserunt.",
      location: "LONDON UK"
    }
  ]

  return (
    <div className="w-full bg-black min-h-screen py-12 small:py-16 flex items-center relative overflow-hidden">
      {/* Background accent element */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
      
      <div className="px-4 max-w-7xl mx-auto w-full">
        <Text className="text-3xl small:text-4xl medium:text-5xl font-['Anton'] text-white text-center mb-8 small:mb-12 medium:mb-16 relative z-10 drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)]">
          CUSTOMER REVIEWS
        </Text>
        
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 medium:grid-cols-2 large:grid-cols-3 gap-6 small:gap-8">
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className={`transform transition-all duration-500 ${
                index === 1 && 'medium:translate-y-[-20px] large:translate-y-[-30px]'
              }`}
              style={{ 
                perspective: '1000px',
                transform: `rotateY(${index % 2 === 0 ? '-3deg' : '3deg'}) translateZ(0)`,
              }}
            >
              <ReviewCard {...review} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-amber-500/5 to-transparent"></div>
    </div>
  )
} 