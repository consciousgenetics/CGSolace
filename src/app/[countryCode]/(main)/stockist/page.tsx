'use client'

import React from 'react'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'
import dynamic from 'next/dynamic'

// Use dynamic import with no SSR to avoid hydration issues
const StockistMap = dynamic(() => import('./stockist-map'), { ssr: false })

export default function StockistPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="-mt-[60px] xsmall:-mt-[70px] medium:-mt-[80px] pt-[60px] xsmall:pt-[70px] medium:pt-[80px]">
        <Container className="py-6 small:py-8 medium:py-12">
          <Box className="mx-auto max-w-4xl">
            <Heading as="h1" className="text-3xl small:text-4xl font-anton text-center mb-8 text-yellow-400">
              AUTHORIZED STOCKISTS
            </Heading>
            
            <Text className="mb-10 text-lg text-center text-gray-300">
              
            </Text>

            <style jsx global>{`
              @keyframes fade-in-top {
                0% {
                  opacity: 0;
                  transform: translateY(-10px) translateX(-50%);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) translateX(-50%);
                }
              }
              
              .animate-fade-in-top {
                animation: fade-in-top 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }
              
              .animation-delay-500 {
                animation-delay: 500ms;
              }
            `}</style>

            <Box className="mb-16">
              <StockistMap />
            </Box>
            
            <Box className="grid gap-10 small:grid-cols-2 medium:gap-16">
              <Box className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-800">
                <Heading as="h2" className="text-2xl font-anton mb-4 text-yellow-400">UK and EU Distributors</Heading>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="https://www.puresativa.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">www.puresativa.com</a></li>
                  <li><a href="https://www.thepureplug.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">www.thepureplug.com</a></li>
                </ul>
              </Box>
              
              <Box className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-800">
                <Heading as="h2" className="text-2xl font-anton mb-4 text-yellow-400">Germany</Heading>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="https://topshelfvault.de" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">topshelfvault.de</a></li>
                  <li><a href="https://www.linda-seeds.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">linda-seeds.com</a></li>
                </ul>
              </Box>
              
              <Box className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-800">
                <Heading as="h2" className="text-2xl font-anton mb-4 text-yellow-400">Thailand</Heading>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="https://www.samuiseedbank.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">samuiseedbank.com</a></li>
                  <li><a href="https://growland.asia" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">growland.asia</a></li>
                </ul>
              </Box>
              
              <Box className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-800">
                <Heading as="h2" className="text-2xl font-anton mb-4 text-yellow-400">Spain</Heading>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="https://www.thepureplug.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">www.thepureplug.com</a></li>
                  <li><a href="https://www.gardenseedstrading.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">gardenseedstrading.com</a></li>
                </ul>
              </Box>
              
              <Box className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-800">
                <Heading as="h2" className="text-2xl font-anton mb-4 text-yellow-400">Poland</Heading>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="https://panpestka.pl" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">panpestka.pl</a></li>
                  <li><a href="https://www.breedbros.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">breedbros.com</a></li>
                  <li><a href="https://www.Weedfarma.pl" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">weedfarma.pl</a></li>
                </ul>
              </Box>
              
              <Box className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-800">
                <Heading as="h2" className="text-2xl font-anton mb-4 text-yellow-400">Austria</Heading>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="https://www.roots-botanik.at" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">roots-botanik.at</a></li>
                  <li><a href="https://pars-planet.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">pars-planet.com</a></li>
                </ul>
              </Box>
              
              <Box className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-800">
                <Heading as="h2" className="text-2xl font-anton mb-4 text-yellow-400">Luxembourg</Heading>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="https://brocoli.lu" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">brocoli.lu</a></li>
                </ul>
              </Box>
              
              <Box className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-md border border-gray-800">
                <Heading as="h2" className="text-2xl font-anton mb-4 text-yellow-400">Italy</Heading>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="https://www.seaofgreen.it" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">seaofgreen.it</a></li>
                </ul>
              </Box>
            </Box>
          </Box>
        </Container>
      </div>
    </div>
  )
} 