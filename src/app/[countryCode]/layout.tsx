import { Metadata } from 'next'
import NavWrapper from '@modules/layout/templates/nav'
import Footer from '@modules/layout/templates/footer'
import AgeVerificationWrapper from '@modules/common/components/age-verification/wrapper'
import { CountdownProvider } from '@lib/context/CountdownContext'
import SubscribeSection from '@modules/common/components/subscribe-section'

export const metadata: Metadata = {
  title: 'Conscious Genetics',
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
    <CountdownProvider>
      <div>
        <AgeVerificationWrapper />
        <NavWrapper countryCode={params.countryCode} />
        <main className="relative flex-grow">
          {children}
        </main>
        <SubscribeSection />
        <Footer countryCode={params.countryCode} />
      </div>
    </CountdownProvider>
  )
} 