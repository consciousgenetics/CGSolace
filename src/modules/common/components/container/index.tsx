import React from 'react'

import { cn } from '@lib/util/cn'
import { cva } from 'cva'

const containerVariants = cva({
  base: 'xsmall:px-6 small:px-10 medium:px-14 xsmall:py-8 small:py-12 medium:py-16 mx-auto box-content px-3 py-6',
  variants: {
    maxWidth: {
      sm: 'max-w-[600px]',
      md: 'max-w-[900px]',
      lg: 'max-w-[1328px]',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    maxWidth: 'lg',
  },
})

type ContainerProps<T extends React.ElementType> = {
  as?: T
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>

const Container = <T extends React.ElementType = 'div'>({
  as,
  maxWidth,
  children,
  className,
  ...props
}: ContainerProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerProps<T>>) => {
  const Component = as || 'div'

  return (
    <Component
      className={cn(containerVariants({ maxWidth }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export { Container }
