import { Metadata } from 'next'
import NavWrapper from '@modules/layout/templates/nav'
import Footer from '@modules/layout/templates/footer'
import AgeVerificationWrapper from '@modules/common/components/age-verification/wrapper'

export const metadata: Metadata = {
  title: 'Solace Store',
  description: 'Your premium cannabis store',
}

export default async function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { countryCode: string }
}) {
  return (
    <div>
      <AgeVerificationWrapper />
      <NavWrapper countryCode={params.countryCode} />
      <main className="relative flex-grow">
        {children}
      </main>
      <Footer countryCode={params.countryCode} />
    </div>
  )
} 