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
    <Box className="bg-white rounded-[30px] p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl h-full w-full min-h-[360px] justify-between"
         style={{
           transform: "perspective(1000px) rotateX(2deg)",
           transformStyle: "preserve-3d",
           boxShadow: "0 15px 25px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.1)"
         }}>
      {/* Enhanced 3D Star Rating */}
      <div className="flex mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative mx-1.5 transform hover:scale-125 transition-transform duration-300">
            <svg
              className="w-9 h-9 text-orange-500 filter drop-shadow-lg"
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
        <Text className="text-2xl font-['Anton'] mb-5 transform transition-all duration-300 hover:scale-105 text-black">{name}</Text>
        <Text className="text-gray-600 mb-6 text-lg leading-relaxed">{review}</Text>
      </div>
      
      <div className="mt-auto">
        <Text className="text-xl font-['Anton'] text-black transform hover:translate-y-[-2px] transition-transform duration-300">{location}</Text>
        
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
    <div className="w-full bg-black h-screen flex items-center py-16 relative overflow-hidden">
      {/* Background accent element */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
      
      <div className="px-4 max-w-7xl mx-auto">
        <Text className="text-5xl font-['Anton'] text-white text-center mb-16 relative z-10 drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)]">
          CUSTOMER REVIEWS
        </Text>
        
        {/* Table-based layout for guaranteed side-by-side positioning */}
        <div className="w-full" style={{ display: 'table', tableLayout: 'fixed' }}>
          <div style={{ display: 'table-row' }}>
            {reviews.map((review, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'table-cell',
                  width: '33.333%',
                  padding: '0 12px',
                  verticalAlign: 'top',
                  perspective: '1000px',
                  transform: `rotateY(${index % 2 === 0 ? '-3deg' : '3deg'}) translateZ(0) ${index === 1 ? 'translateY(-30px)' : ''}`,
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <ReviewCard {...review} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-amber-500/5 to-transparent"></div>
    </div>
  )
} 