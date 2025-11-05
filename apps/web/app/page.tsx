import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">NetworkingX</h1>
            <p className="text-xl text-gray-600">
              Business Networking Groups Management Platform
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Join Our Network</CardTitle>
                <CardDescription>
                  Submit your participation intent and become part of our business networking
                  community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/intent">
                  <Button className="w-full" size="lg">
                    Submit Intent to Join
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Already Have an Invite?</CardTitle>
                <CardDescription>
                  Complete your registration using the invite token you received
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/register">
                  <Button variant="outline" className="w-full" size="lg">
                    Register with Token
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Admin Access */}
          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
              <CardDescription className="text-gray-300">
                Manage participation intents and member registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/intents">
                <Button variant="secondary" className="w-full" size="lg">
                  Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>
              Built with Next.js, TypeScript, and Fastify
              <br />
              Clean Architecture • PostgreSQL • TanStack Query
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
