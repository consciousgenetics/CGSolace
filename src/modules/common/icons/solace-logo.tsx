import Image from 'next/image'
import { IconProps } from 'types/icon'

export const SolaceLogo = ({ className, ...props }: IconProps) => {
  return (
    <div className={className}>
      <Image 
        src="/images/logo/conscious-genetix-logo.png" 
        alt="Conscious Genetix Logo"
        width={160}
        height={45}
        priority
      />
    </div>
  )
}
