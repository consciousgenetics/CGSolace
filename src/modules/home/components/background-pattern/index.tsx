'use client'

import Image from 'next/image'

export default function BackgroundPattern() {
  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <Image
        src="/127.png"
        alt="Background pattern"
        fill
        className="object-cover opacity-70"
        sizes="100vw"
        priority
        onError={(e) => {
          console.error('Error loading image:', e);
          const imgElement = e.currentTarget as HTMLImageElement;
          if (!imgElement.src.includes('/127.png')) {
            imgElement.src = '/127.png';
          }
        }}
      />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
    </div>
  )
} 