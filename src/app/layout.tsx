import { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { getBaseURL } from '@lib/util/env'
import { ProgressBar } from '@modules/common/components/progress-bar'
import { ThemeProvider } from '@modules/common/components/theme-provider'
import { CorsProxyProvider } from '@modules/common/components/cors-proxy-provider'
import { CountdownProvider } from '@lib/context/CountdownContext'
import { Toaster } from 'sonner'
import CookieConsentBanner from '@modules/common/components/cookie-consent'

import 'styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

// Increase revalidation period to reduce API calls
export const revalidate = 3600 // 1 hour

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <CountdownProvider>
            <CorsProxyProvider>
              <div className="text-black">
                <ProgressBar />
                <Toaster position="bottom-right" offset={65} closeButton />
                <main className="relative">{props.children}</main>
                <CookieConsentBanner />
              </div>
            </CorsProxyProvider>
          </CountdownProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
