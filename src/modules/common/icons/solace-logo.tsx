"use client"

import { useState } from 'react'
import Image from 'next/image'
import { IconProps } from 'types/icon'

export const SolaceLogo = ({ className, ...props }: IconProps) => {
  const [imgError, setImgError] = useState(false)
  
  return (
    <div className={className}>
      {!imgError ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/conscious-genetics-logo.png`}
          alt="Conscious Genetix Logo"
          width={160}
          height={40}
          priority
          style={{ width: 'auto', height: '100%', maxWidth: '160px' }}
          onError={() => setImgError(true)}
        />
      ) : (
        // Fallback to text if image fails to load
        <span style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          Conscious Genetix
        </span>
      )}
    </div>
  )
}
