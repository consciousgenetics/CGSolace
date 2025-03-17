import { Metadata } from 'next'
import { AboutTemplate } from '@modules/about/templates/about-template'

export const metadata: Metadata = {
  title: 'About Us | Conscious Genetics',
  description: 'Learn about Conscious Genetics, a UK-based cannabis breeder since 2016, specializing in premium quality strains and innovative breeding techniques.',
}

export default function AboutPage() {
  return <AboutTemplate />
} 