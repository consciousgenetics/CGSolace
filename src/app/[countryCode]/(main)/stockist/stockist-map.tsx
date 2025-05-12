'use client'

import React, { useState } from 'react'
import Image from 'next/image'

type Location = {
  id: string;
  country: string;
  city?: string;
  x: number;
  y: number;
  distributors: Array<{
    name: string;
    url: string;
  }>;
}

const StockistMap = () => {
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const locations: Location[] = [
    {
      id: 'uk',
      country: 'UK',
      x: 47,
      y: 31.5,
      distributors: [
        { name: 'Pure Sativa', url: 'https://www.puresativa.com' },
        { name: 'The Pure Plug', url: 'https://www.thepureplug.com' }
      ]
    },
    {
      id: 'germany',
      country: 'Germany',
      x: 51.5,
      y: 32.5,
      distributors: [
        { name: 'Top Shelf Vault', url: 'https://topshelfvault.de' },
        { name: 'Linda Seeds', url: 'https://www.linda-seeds.com' }
      ]
    },
    {
      id: 'thailand',
      country: 'Thailand',
      x: 73,
      y: 48,
      distributors: [
        { name: 'Samui Seed Bank', url: 'https://www.samuiseedbank.com' },
        { name: 'Growland', url: 'https://growland.asia' }
      ]
    },
    {
      id: 'spain',
      country: 'Spain',
      x: 46.5,
      y: 37,
      distributors: [
        { name: 'The Pure Plug', url: 'https://www.thepureplug.com' },
        { name: 'Garden Seeds Trading', url: 'https://www.gardenseedstrading.com' }
      ]
    },
    {
      id: 'poland',
      country: 'Poland',
      x: 55,
      y: 32.5,
      distributors: [
        { name: 'Pan Pestka', url: 'https://panpestka.pl' },
        { name: 'Breed Bros', url: 'https://www.breedbros.com' }
      ]
    },
    {
      id: 'austria',
      country: 'Austria',
      x: 52.5,
      y: 34.5,
      distributors: [
        { name: 'Roots Botanik', url: 'https://www.roots-botanik.at' },
        { name: 'Pars Planet', url: 'https://pars-planet.com' }
      ]
    },
    {
      id: 'luxembourg',
      country: 'Luxembourg',
      x: 49.5,
      y: 33.5,
      distributors: [
        { name: 'Brocoli', url: 'https://brocoli.lu' }
      ]
    },
    {
      id: 'italy',
      country: 'Italy',
      x: 52,
      y: 37.5,
      distributors: [
        { name: 'Sea of Green', url: 'https://www.seaofgreen.it' }
      ]
    }
  ];

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg aspect-[2/1] w-full">
      {/* Enhanced container with multiple shadows and golden glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black p-1.5 rounded-xl 
                      shadow-[0_0_25px_rgba(0,0,0,0.3),inset_0_0_5px_rgba(244,208,63,0.5)]">
        <div className="absolute inset-1 rounded-lg border border-yellow-500/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]"></div>
        
        {/* World Map Image with Enhanced Glow Effect */}
        <div className="absolute inset-2 flex items-center justify-center rounded-lg overflow-hidden">
          <div className="relative w-full h-full rounded-lg overflow-hidden 
                        shadow-[0_0_30px_rgba(244,208,63,0.4),inset_0_0_10px_rgba(0,0,0,0.8)] 
                        border-2 border-yellow-500/40
                        before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/30 before:to-transparent before:pointer-events-none
                        after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-l after:from-black/20 after:to-transparent after:pointer-events-none">
            <div className="relative w-full h-full">
              <Image 
                src="/worldmap.jpg" 
                alt="World Map" 
                fill 
                className="object-fit" 
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                  transform: 'scale(1.15)',
                  transformOrigin: 'center'
                }}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map Title */}
      <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-3 text-white 
                    border border-yellow-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.5),0_0_8px_rgba(244,208,63,0.3)]">
        <div className="text-yellow-400 font-medium">Conscious Genetics</div>
        <div className="text-xs text-white/80">Global Distribution Network</div>
      </div>

      {/* Markers */}
      <div className="absolute inset-0">
        {locations.map((location) => (
          <div key={location.id} 
               className="absolute"
               style={{ 
                 left: `${location.x}%`, 
                 top: `${location.y}%`,
                 transform: 'translate(-50%, -50%)',
                 zIndex: activeLocation === location.id ? 30 : 10
               }}
          >
            {/* Location Marker */}
            <button 
              className="relative block outline-none focus:outline-none cursor-pointer w-8 h-8"
              onClick={() => setActiveLocation(location.id === activeLocation ? null : location.id)}
              onMouseEnter={() => setActiveLocation(location.id)}
              onMouseLeave={() => setActiveLocation(null)}
              aria-label={`Show ${location.country} distributors`}
            >
              <div className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-4 h-4 rounded-full
                ${activeLocation === location.id ? 'bg-yellow-400' : 'bg-yellow-500'}
                transition-all duration-300 ease-in-out
                ${activeLocation === location.id ? 'scale-150' : 'scale-100'}
                border-2 ${activeLocation === location.id ? 'border-yellow-200' : 'border-yellow-600'}
              `}>
                {/* Inner glow */}
                <div className={`
                  absolute inset-0 rounded-full
                  ${activeLocation === location.id ? 'bg-yellow-300' : 'bg-yellow-400'}
                  blur-[1px] opacity-70
                `}></div>
                
                {/* Pulse animation */}
                <div className={`
                  absolute inset-0 rounded-full
                  ${activeLocation === location.id ? 'bg-yellow-500' : 'bg-yellow-600'}
                  opacity-70 border border-yellow-400
                  animate-ping
                  ${activeLocation === location.id ? 'scale-100' : 'scale-75'}
                `}></div>
              </div>
            </button>

            {/* Tooltip */}
            {activeLocation === location.id && (
              <div 
                className="absolute z-40 bg-black bg-opacity-90 rounded-lg p-3 shadow-lg shadow-yellow-500/20 w-48 backdrop-blur-sm border border-yellow-500/30"
                style={{ 
                  bottom: 'calc(100% + 10px)',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="text-yellow-400 font-bold mb-1">{location.country}</div>
                <ul className="space-y-1">
                  {location.distributors.map((distributor, index) => (
                    <li key={index}>
                      <a 
                        href={distributor.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-yellow-300 text-sm transition-colors flex items-center"
                      >
                        <span className="mr-1">→</span> {distributor.name}
                      </a>
                    </li>
                  ))}
                </ul>
                {/* Triangle pointer */}
                <div 
                  className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-500/30"
                  style={{ bottom: '-8px', left: 'calc(50% - 8px)' }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StockistMap