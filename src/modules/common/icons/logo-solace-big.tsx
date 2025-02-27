"use client"

import { useState } from 'react'
import { IconProps } from 'types/icon'

export const SolaceLogoBig = ({ className, ...props }: IconProps) => {
  const [imgError, setImgError] = useState(false)
  
  // Base path for the image
  const basePath = process.env.NEXT_PUBLIC_BASE_URL || ''
  
  return (
    <div className={className}>
      {!imgError ? (
        <img 
          src={`${basePath}/public/conscious-genetics-logo.png`}
          alt="Conscious Genetics Logo"
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
