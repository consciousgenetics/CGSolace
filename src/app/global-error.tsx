'use client'

import { useEffect } from 'react'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error)
  }, [error])

  return (
    <html>
      <body>
        <Container className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-32">
          <div className="flex flex-col items-center justify-center gap-y-4">
            <Heading as="h1" className="text-2xl-semi text-basic-primary">
              Something went wrong!
            </Heading>
            <Text className="text-center text-secondary">
              We apologize for the inconvenience. Our team has been notified of this issue.
              <br />
              Error code: {error.digest}
            </Text>
            <div className="mt-4 flex items-center justify-center gap-x-4">
              <Button
                className="w-[200px]"
                onClick={() => reset()}
              >
                Try again
              </Button>
              <Button
                variant="ghost"
                className="w-[200px]"
                onClick={() => window.location.href = '/'}
              >
                Go to homepage
              </Button>
            </div>
          </div>
        </Container>
      </body>
    </html>
  )
} 