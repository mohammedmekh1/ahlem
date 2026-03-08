'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="mb-8 text-gray-600">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => reset()}
            variant="default"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Go back home
          </Button>
        </div>
      </div>
    </div>
  )
}
