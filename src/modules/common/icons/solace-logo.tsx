import { IconProps } from 'types/icon'

export const SolaceLogo = ({ className, ...props }: IconProps) => {
  return (
    <div className={className}>
      <img 
        src="/images/logo/conscious-genetix-logo.png" 
        alt="Conscious Genetix Logo"
        style={{ width: 'auto', height: '100%', maxWidth: '160px' }}
      />
    </div>
  )
}
