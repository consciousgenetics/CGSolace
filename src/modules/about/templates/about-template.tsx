'use client'

import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'
import { Box } from '@modules/common/components/box'

interface AboutSectionProps {
  title: string
  content: string
  imageUrl?: string
}

const AboutSection = ({ title, content, imageUrl }: AboutSectionProps) => {
  return (
    <Box className="bg-white rounded-[30px] p-6 small:p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl h-full w-full justify-between mb-8 small:mb-0"
         style={{
           transform: "perspective(1000px) rotateX(2deg)",
           transformStyle: "preserve-3d",
           boxShadow: "0 15px 25px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.1)"
         }}>
      <div className="flex-1 flex flex-col justify-center">
        <Text className="text-2xl small:text-3xl font-['Anton'] mb-6 transform transition-all duration-300 hover:scale-105 text-black">{title}</Text>
        <Text className="text-gray-600 mb-4 text-base small:text-lg leading-relaxed">{content}</Text>
      </div>
      
      {imageUrl && (
        <div className="mt-6 w-full h-48 small:h-64 relative rounded-xl overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transform transition-all duration-500 hover:scale-110"
          />
        </div>
      )}
      
      {/* 3D effect bottom accent */}
      <div className="w-24 h-1 bg-black mt-6 mx-auto rounded-full shadow-md transform transition-all duration-300 hover:scale-110"></div>
    </Box>
  )
}

export function AboutTemplate() {
  const sections = [
    {
      title: "UK Premium Quality since 2016",
      content: "Conscious Genetics is a UK-based breeder who began their breeding journey in 2016, though they had been a dedicated cannabis enthusiast and grower for many years prior. Working behind the scenes with some of the pioneers in the cannabis industry, Conscious Genetics became inspired to create their own unique strains.",
      imageUrl: "/about-1.jpg"
    },
    {
      title: "From Classic to Purple Strains",
      content: "During their journey, Conscious Genetics developed a fascination with purple strains. Traditionally, purple strains have been seen as lacking in terpenes and THC, but Conscious Genetics set out to change this narrative. We believe that anthocyanins—natural pigments found in deep red, purple, and blue fruits and vegetables—offer substantial medicinal benefits.",
      imageUrl: "/about-2.jpg"
    },
    {
      title: "REDEFINING QUALITY",
      content: "Conscious Genetics is redefining the standard for purple strains by elevating their terpene profiles and potency. By meticulously selecting and breeding purple phenotypes, they are crafting strains that not only deliver striking color but also complex, rich terpene profiles—truly putting 'terps into purps' and setting a new benchmark for quality in cannabis.",
      imageUrl: "/about-3.jpg"
    },
    {
      title: "Old School Meets New School",
      content: "It's not just purple strains that Conscious Genetics has created. They also had a vision of bringing back some of the old-school strains from around the world. They began crossing their strains with classic varieties like Exodus Cheese, Shoreline, and OG Kush. While new-school genetics like Gelato, Zkittlez, and Runtz have dominated the cannabis industry, Conscious Genetics aimed to blend the old-school with the new-school to create unique terpene profiles.",
      imageUrl: "/about-4.jpg"
    }
  ]

  return (
    <div className="w-full min-h-screen py-12 small:py-16 flex items-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-10">
        <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: 'url("/127-wide.png")', backgroundSize: '900px', imageRendering: 'crisp-edges' }}></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="px-4 max-w-7xl mx-auto w-full relative z-20">
        <Text className="text-3xl small:text-4xl medium:text-5xl font-['Anton'] text-white text-center mb-8 small:mb-12 medium:mb-16 relative z-10 drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)]">
          ABOUT CONSCIOUS GENETICS
        </Text>
        
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 medium:grid-cols-2 gap-6 small:gap-8">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="transform transition-all duration-500"
              style={{ 
                perspective: '1000px',
                transform: `rotateY(${index % 2 === 0 ? '-3deg' : '3deg'}) translateZ(0)`,
              }}
            >
              <AboutSection {...section} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 