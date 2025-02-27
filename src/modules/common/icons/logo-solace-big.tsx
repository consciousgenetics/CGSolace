import Image from 'next/image'
import { IconProps } from 'types/icon'

export const SolaceLogoBig = ({ className, ...props }: IconProps) => {
  return (
    <div className={className}>
      <Image 
        src="/images/logo/conscious-genetix-logo.png" 
        alt="Conscious Genetix Logo"
        width={320}
        height={90}
        style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
        priority
      />
    </div>
  )
}
