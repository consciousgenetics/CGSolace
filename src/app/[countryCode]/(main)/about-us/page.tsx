import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Conscious Genetics',
  description: 'Learn about Conscious Genetics, a UK-based cannabis breeder since 2016, specializing in premium quality strains and innovative breeding techniques.',
}

import { AboutTemplate } from '@modules/about/templates/about-template'

export default function AboutUsPage() {
  return <AboutTemplate />
}
