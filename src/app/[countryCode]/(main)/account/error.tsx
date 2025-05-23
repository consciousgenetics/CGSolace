'use client'

import { useEffect } from 'react'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@medusajs/ui'
import { Text } from '@modules/common/components/text'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <Box className="bg-secondary">
      <Container className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-16">
        <Box className="max-w-lg text-center">
          <Heading level="h1" className="mb-4 text-2xl">
            Something went wrong
          </Heading>
          <Text className="mb-8 text-lg">
            We encountered an issue while connecting to your account. This could be a temporary connection problem.
          </Text>
          
          <Box className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={reset} variant="filled">
              Try again
            </Button>
            <LocalizedClientLink href="/">
              <Button variant="ghost">Return to home</Button>
            </LocalizedClientLink>
          </Box>
        </Box>
      </Container>
    </Box>
  )
} 