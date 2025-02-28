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
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body suppressHydrationWarning className="overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="text-basic-primary overflow-x-hidden">
            <ProgressBar />
            <Toaster position="bottom-right" offset={65} closeButton />
            <main className="relative overflow-x-hidden">{props.children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
