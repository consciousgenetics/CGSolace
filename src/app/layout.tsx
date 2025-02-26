import { Metadata } from 'next'

import { getBaseURL } from '@lib/util/env'
import { ProgressBar } from '@modules/common/components/progress-bar'
import { ThemeProvider } from '@modules/common/components/theme-provider'
import { Toaster } from 'sonner'

import 'styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="text-basic-primary">
            <ProgressBar />
            <Toaster position="bottom-right" offset={65} closeButton />
            <main className="relative">{props.children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
