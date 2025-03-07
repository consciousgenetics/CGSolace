import { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { getBaseURL } from '@lib/util/env'
import { ProgressBar } from '@modules/common/components/progress-bar'
import { ThemeProvider } from '@modules/common/components/theme-provider'
import { CorsProxyProvider } from '@modules/common/components/cors-proxy-provider'
import { Toaster } from 'sonner'

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
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CorsProxyProvider>
            <div className="text-basic-primary">
              <ProgressBar />
              <Toaster position="bottom-right" offset={65} closeButton />
              <main className="relative">{props.children}</main>
            </div>
          </CorsProxyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
