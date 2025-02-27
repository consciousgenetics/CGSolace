"use client"

import { useState } from 'react'
import { IconProps } from 'types/icon'

export const SolaceLogo = ({ className, ...props }: IconProps) => {
  const [imgError, setImgError] = useState(false)
  
  // Base path for the image
  const basePath = process.env.NEXT_PUBLIC_BASE_URL || ''
  
  return (
    <div className={className}>
      {!imgError ? (
        <img 
          src={`${basePath}/images/logo/conscious-genetics-logo.png`}
          alt="Conscious Genetix Logo"
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
