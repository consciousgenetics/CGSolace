'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './styles.css'

const RedKachinaHero = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  // Add global styling fixes on component mount
  useEffect(() => {
    // Add classes to fix header spacing
    document.body.classList.add('red-kachina-page');
    
    // Find header element and add fix class
    const header = document.querySelector('header');
    if (header) {
      header.classList.add('red-kachina-header-fix');
    }

    // Find and fix menu bar spacing
    const menuBar = document.querySelector('nav') || 
                    document.querySelector('header > div:last-child') ||
                    document.querySelector('header ~ div:first-of-type');
    
    if (menuBar) {
      menuBar.classList.add('red-kachina-menu-fix');
      const menuBarEl = menuBar as HTMLElement;
      menuBarEl.style.marginBottom = '0';
      menuBarEl.style.paddingBottom = '0';
    }

    // Create a style element to inject urgent fixes
    const style = document.createElement('style');
    style.innerHTML = `
      body.red-kachina-page header ~ div {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }
      
      .red-kachina-menu-fix + * {
        margin-top: 0 !important;
      }
      
      .red-kachina-hero-banner {
        position: relative;
        z-index: 10;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.body.classList.remove('red-kachina-page');
      if (header) {
        header.classList.remove('red-kachina-header-fix');
      }
      if (menuBar) {
        menuBar.classList.remove('red-kachina-menu-fix');
        const menuBarEl = menuBar as HTMLElement;
        menuBarEl.style.marginBottom = '';
        menuBarEl.style.paddingBottom = '';
      }
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div ref={bannerRef} className="w-full bg-[#FDD729] z-10 relative red-kachina-hero-banner pt-8 pb-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-black text-white rounded-xl overflow-hidden shadow-lg">
          {/* Black top section */}
          <div className="py-10 px-6 relative overflow-hidden">
            {/* Circular decorative elements */}
            <div className="absolute w-[300px] h-[300px] bg-[#FDD729]/10 rounded-full top-[-150px] left-[-150px]"></div>
            <div className="absolute w-[300px] h-[300px] bg-[#FDD729]/10 rounded-full bottom-[-150px] right-[-150px]"></div>
            
            <div className="text-center relative z-10">
              <div className="mb-1">
                <span className="text-sm uppercase tracking-wider">LIMITED TIME</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-sans uppercase mb-4">
                BUY 2 GET 1 FREE
              </h1>
              
              <p className="text-xl max-w-xl mx-auto mb-8">
                Limited time offer on all Red Kachina seeds
              </p>
              
              <button className="bg-[#FDD729] text-black font-bold py-3 px-10 rounded-md text-lg uppercase hover:bg-[#f0ca20]">
                SHOP NOW
              </button>
            </div>
          </div>
          
          {/* Bottom section with black background */}
          <div className="bg-black py-5 px-6 relative overflow-hidden border-t border-[#FDD729]/30">
            {/* Circular decorative elements */}
            <div className="absolute w-[200px] h-[200px] bg-[#FDD729]/5 rounded-full top-[-100px] left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute w-[200px] h-[200px] bg-[#FDD729]/5 rounded-full bottom-[-140px] left-[10%]"></div>
            <div className="absolute w-[200px] h-[200px] bg-[#FDD729]/5 rounded-full bottom-[-140px] right-[10%]"></div>
            
            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 relative z-10">
              <div className="flex items-center bg-[#FDD729]/20 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Premium Genetics</span>
              </div>
              <div className="flex items-center bg-[#FDD729]/20 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Fast Shipping</span>
              </div>
              <div className="flex items-center bg-[#FDD729]/20 px-4 py-2 rounded-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Guaranteed Quality</span>
              </div>
            </div>
            
            <p className="text-[#FDD729]/80 text-sm text-center mt-4 relative z-10">
              Mix and match any Red Kachina strains. Limited time promotion while supplies last.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RedKachinaHero 