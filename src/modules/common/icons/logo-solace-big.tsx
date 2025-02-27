"use client"

import { useState } from 'react'
import Image from 'next/image'
import { IconProps } from 'types/icon'

export const SolaceLogoBig = ({ className, ...props }: IconProps) => {
  const [imgError, setImgError] = useState(false)
  
  return (
    <div className={className}>
      {!imgError ? (
        <Image
          src="/conscious-genetics-logo.png"
          alt="Conscious Genetix Logo"
          width={320}
          height={80}
          style={{ width: 'auto', height: '100%', maxWidth: '320px', objectFit: 'contain' }}
          onError={() => setImgError(true)}
        />
      ) : (
        // Fallback to text if image fails to load
        <span style={{ 
          color: 'white', 
          fontSize: '22px', 
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          Conscious Genetix
        </span>
      )}
    </div>
  )
}
