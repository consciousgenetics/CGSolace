'use client'

import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import Link from 'next/link'
import Image from 'next/image'

export function AboutTemplate() {
  return (
    <div className="flex flex-col w-full">
      {/* First Section - Logo and Intro */}
      <div className="w-full bg-white py-8">
        <Container className="grid grid-cols-1 small:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <div className="flex justify-center small:justify-start">
            <Image 
              src="/conscious-genetics-logo.png" 
              alt="Conscious Genetics Logo" 
              width={300}
              height={150}
              className="w-full max-w-[300px]"
              unoptimized
              priority
            />
          </div>
          
          <div>
            <Text className="text-gray-600 mb-2 font-semibold text-sm small:text-base">
              Conscious Genetics
            </Text>
            <Heading className="text-xl small:text-2xl medium:text-3xl font-bold mb-4">
              UK Premium Quality since 2016
            </Heading>
            <Text className="font-bold uppercase mb-4 text-sm small:text-base">
              PUTTING TERPS INTO THOSE PURPS
            </Text>
            <Text className="text-gray-600 text-sm small:text-base">
              Conscious Genetics is a UK-based breeder who began their breeding journey in 2016, 
              though they had been a dedicated cannabis enthusiast and grower for many years prior. 
              Working behind the scenes with some of the pioneers in the cannabis industry, 
              Conscious Genetics became inspired to create their own unique strains.
            </Text>
          </div>
        </Container>
      </div>

      {/* Second Section - From Classic to Purple Strains */}
      <div className="w-full py-16 small:py-20 text-white relative">
        <div className="absolute inset-0 z-0">
          <img 
            src="/126-wide.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          {/* Add an overlay to ensure text remains readable */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <Container className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl small:text-6xl font-bold mb-10 text-center">
            From Classic to Purple Strains
          </h2>
          <div className="space-y-8 max-w-4xl mx-auto text-center">
            <p className="text-base small:text-xl">
              During their journey, Conscious Genetics developed a fascination with purple strains. 
              Traditionally, purple strains have been seen as lacking in terpenes and THC, but 
              Conscious Genetics set out to change this narrative. At Conscious Genetics, we believe 
              that anthocyanins—natural pigments found in deep red, purple, and blue fruits and 
              vegetables—offer substantial medicinal benefits. These anthocyanins, part of a larger 
              group of plant-based flavonoids, are thought to provide a range of health benefits, 
              and we theorized that the same might apply to cannabis.
            </p>
            <p className="text-base small:text-xl">
              Over the years, Conscious Genetics has overcome many challenges, with each creation 
              representing a step forward in the mission to enhance terpene profiles, THC levels, 
              resin production, density, and vibrant colors. Each strain we have created serves as 
              a testament to our commitment to quality and innovation in cannabis breeding.
            </p>
            <p className="text-base small:text-xl">
              Conscious Genetics hasn't just focused on creating purple strains; they also envisioned 
              reviving some classic, old-school strains from around the world. They began crossing 
              their strains with iconic varieties like Exodus Cheese, Shoreline, and OG Kush. While 
              new-school genetics such as Gelato, Zkittlez, and Runtz have dominated the cannabis 
              industry in recent years, Conscious Genetics sought to blend old-school and new-school 
              genetics to craft unique terpene profiles.
            </p>
            <p className="text-base small:text-xl">
              After eight years of dedicated breeding, phenotype hunting, and selecting some of the 
              best clones from around the world, Conscious Genetics now offers multiple sold-out 
              feminized seed lines. Their latest releases include three feminized seed lines and one 
              regular seed line. Please remember that all seeds are intended for souvenir purposes 
              only, and it's essential to check your country's laws regarding germination.
            </p>
          </div>
        </Container>
      </div>
      
      {/* Combined Section - Redefining Quality and Flavor in 2-column grid */}
      <div className="w-full py-8 bg-white">
        <Container className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 medium:grid-cols-2 gap-0 relative">
            {/* Top Left Image */}
            <div className="w-full h-full">
              <img 
                src="/Pink-Quavers.png" 
                alt="Pink Quavers" 
                className="w-full h-full object-cover" 
          />
        </div>
            
            {/* Top Right Text */}
            <div className="pl-8 medium:pl-16 pr-12 py-12 text-left">
              <div className="text-gray-800 uppercase text-base font-normal mb-2">
                CONSCIOUS GENETICS
              </div>
              <h2 className="h2 mb-8 uppercase">
                REDEFINING QUALITY
              </h2>
              <div className="text-gray-800 text-base medium:text-xl leading-relaxed space-y-8">
                <p>
                  Conscious Genetics is redefining the standard for purple strains by elevating their 
                  terpene profiles and potency. Traditionally, purple strains have been known more for 
                  their vibrant color than their flavor and effects, but Conscious Genetics is changing 
                  that narrative.
                </p>
                <p>
                  By meticulously selecting and breeding purple phenotypes, they are crafting strains 
                  that not only deliver striking color but also complex, rich terpene profiles—truly 
                  putting "terps into purps" and setting a new benchmark for quality in purple cannabis.
                </p>
              </div>
            </div>
            
            {/* Bottom Left Text */}
            <div className="pl-0 pr-12 py-12 text-left">
              <div className="text-gray-800 uppercase text-base font-normal mb-2">
                CONSCIOUS GENETICS
              </div>
              <h2 className="h2 mb-8 uppercase">
                REDEFINING FLAVOR
              </h2>
              <div className="text-gray-800 text-base medium:text-xl leading-relaxed space-y-8">
                <p>
                  Redefining flavor in cannabis strains involves exploring innovative breeding 
                  techniques and terpene profiles to create unique taste experiences.
                </p>
                <p>
                  By emphasizing distinct flavor combinations, cultivators can enhance the sensory 
                  appeal of their strains, making them more enjoyable for consumers. This evolution 
                  not only broadens the spectrum of available flavors but also emphasizes the connection 
                  between taste, aroma, and the overall cannabis experience.
                </p>
              </div>
            </div>
            
            {/* Bottom Right Image */}
            <div className="w-full h-full">
              <img 
                src="/ckaboutus.png" 
                alt="Chronic's Kush" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </Container>
      </div>
      
      {/* Fifth Section - Old School Meets New School */}
      <div className="w-full py-16 small:py-20 text-black relative">
        <div className="absolute inset-0 z-0">
          <img 
            src="/127-wide.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <Container className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl small:text-6xl font-bold mb-10 text-center">
            Old School Meets New School
          </h2>
          <div className="space-y-8 max-w-4xl mx-auto text-center">
            <p className="text-base small:text-xl">
              It's not just purple strains that Conscious Genetics has created. They also had 
              a vision of bringing back some of the old-school strains from around the world. 
              They began crossing their strains with classic varieties like Exodus Cheese, 
              Shoreline, and OG Kush. While new-school genetics like Gelato, Zkittlez, and 
              Runtz have dominated the cannabis industry for the past five years, Conscious 
              Genetics aimed to blend the old-school with the new-school to create unique 
              terpene profiles.
            </p>
            <p className="text-base small:text-xl">
              After eight years of breeding, phenotype hunting, and selecting some of the 
              best clones from around the world, Conscious Genetics now boasts multiple 
              sold-out feminized seed lines. Their most recent creations include three 
              feminized seed lines and one regular seed line. Please note that all seeds 
              are created for souvenir purposes only, and you must check your country's 
              laws regarding germination.
            </p>
          </div>
        </Container>
      </div>

      {/* Sixth Section - Seed Lines Collage */}
      <div className="w-full py-8 small:py-12 bg-white">
        <Container className="max-w-6xl mx-auto">
          <Heading className="text-xl small:text-2xl medium:text-3xl font-bold mb-8 text-center">
            Our Seed Lines
          </Heading>
          
          <div className="grid grid-cols-2 medium:grid-cols-2 large:grid-cols-4 gap-6 small:gap-8">
            {/* Zapplez Card */}
            <Link href="/categories/zapplez" className="block">
              <div className="relative group w-full flex flex-col">
                <div className="bg-black rounded-xl border-[3px] aspect-square flex-shrink-0 overflow-hidden" style={{ borderColor: '#fdd729' }}>
                  <div className="w-full h-full relative p-6">
                    <img 
                      src="/Zapplez.png" 
                      alt="Zapplez" 
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-black text-sm small:text-lg medium:text-xl font-bold uppercase">ZAPPLEZ</h3>
                </div>
              </div>
            </Link>
            
            {/* Pink Waferz Card */}
            <Link href="/categories/pink-waferz" className="block">
              <div className="relative group w-full flex flex-col">
                <div className="bg-black rounded-xl border-[3px] aspect-square flex-shrink-0 overflow-hidden" style={{ borderColor: '#fdd729' }}>
                  <div className="w-full h-full relative p-6">
                    <img 
                      src="/Pink-waflfles.png" 
                      alt="Pink Waferz" 
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-black text-sm small:text-lg medium:text-xl font-bold uppercase">PINK WAFERZ</h3>
                </div>
              </div>
            </Link>
            
            {/* Red Kachina Card */}
            <Link href="/categories/red-kachina" className="block">
              <div className="relative group w-full flex flex-col">
                <div className="bg-black rounded-xl border-[3px] aspect-square flex-shrink-0 overflow-hidden" style={{ borderColor: '#fdd729' }}>
                  <div className="w-full h-full relative p-6">
                    <img 
                      src="/redkachinaicon.png" 
                      alt="Red Kachina" 
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-black text-sm small:text-lg medium:text-xl font-bold uppercase">RED KACHINA</h3>
                </div>
              </div>
            </Link>
            
            {/* Chronic's Kush Card */}
            <Link href="/categories/chronics-kush" className="block">
              <div className="relative group w-full flex flex-col">
                <div className="bg-black rounded-xl border-[3px] aspect-square flex-shrink-0 overflow-hidden" style={{ borderColor: '#fdd729' }}>
                  <div className="w-full h-full relative p-6">
                    <img 
                      src="/Chronic_kush.png" 
                      alt="Chronic's Kush" 
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-black text-sm small:text-lg medium:text-xl font-bold uppercase">CHRONIC'S KUSH</h3>
                </div>
            </div>
            </Link>
        </div>
        </Container>
      </div>
    </div>
  )
} 