import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-extrabold text-primary-600">404</h1>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mb-8 text-gray-600 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/" passHref>
            <Button variant="default">
              Back to Home
            </Button>
          </Link>
          <Link href="/app" passHref>
            <Button variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
