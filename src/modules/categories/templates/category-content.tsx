'use client'

import React, { useEffect } from 'react'
import { Container } from '@modules/common/components/container'
import ClientSideSort from './client-side-sort'
import DynamicCountdownWrapper from './dynamic-countdown-wrapper'

// Helper function to check if the countdown has ended
function isCountdownEnded() {
  // Always return true to bypass the countdown and show products
  return true
}

// Client component that handles styling for Red Kachina pages
const RedKachinaStyleFix = () => {
  useEffect(() => {
    // Add a class to the body element to target specific CSS
    document.body.classList.add('red-kachina-page')

    // Create specific styles for this page's layout
    const style = document.createElement('style')
    style.textContent = `
      /* Improve spacing for content below banner */
      #red-kachina-page {
        padding-top: 0 !important;
      }
      
      /* Adjust content padding */
      #red-kachina-page > .container {
        padding-top: 1rem !important;
      }
    `
    document.head.appendChild(style)
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('red-kachina-page')
      document.head.removeChild(style)
    }
  }, [])
  
  return null;
}

export default function CategoryContent({
  category,
  initialProducts,
  countryCode,
  currentCategory,
  region,
  filters,
}: {
  category: string[]
  initialProducts: {
    results: any[]
    count: number
  }
  countryCode: string
  currentCategory: any
  region: any
  filters: any
}) {
  const isRedKachina = category.includes('red-kachina')
  
  return (
    <>
      {/* Apply white background to entire page with red-kachina-specific class if needed */}
      <div 
        id={isRedKachina ? 'red-kachina-page' : undefined}
        className={`bg-white min-h-screen w-full ${isRedKachina ? 'red-kachina-template' : ''}`}
      >
        {/* Apply styling fix for Red Kachina pages */}
        {isRedKachina && <RedKachinaStyleFix />}
        
        <Container className={`flex flex-col ${isRedKachina ? 'gap-0 !p-0' : 'gap-8 !pb-8 !pt-4'}`}>
          {/* Display category description based on category type */}
          {/* Category specific content would go here */}
          
          {/* For Red Kachina page, conditionally render products or countdown */}
          {isRedKachina && !isCountdownEnded() ? (
            <DynamicCountdownWrapper />
          ) : (
            <ClientSideSort 
              initialProducts={initialProducts}
              countryCode={countryCode}
              currentCategory={currentCategory}
              region={region}
              filters={filters}
            />
          )}
        </Container>
      </div>
    </>
  )
} 