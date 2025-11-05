'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle, XCircle, Copy, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { api, ApiError } from '@/lib/api'
import type { ListIntentsResponse, ApproveIntentResponse, RejectIntentResponse, IntentStatus } from '@/lib/types'

const ADMIN_KEY = 'dev-admin-key-123' // TODO: Move to env or auth context

export default function AdminIntentsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<IntentStatus | 'ALL'>('PENDING')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['intents', filter],
    queryFn: () =>
      api.get<ListIntentsResponse>(
        `/api/admin/intents${filter !== 'ALL' ? `?status=${filter}` : ''}`,
        {
          headers: { 'x-admin-key': ADMIN_KEY },
        }
      ),
  })

  const approveMutation = useMutation({
    mutationFn: (intentId: string) =>
      api.post<ApproveIntentResponse>(`/api/admin/intents/${intentId}/approve`, undefined, {
        headers: { 'x-admin-key': ADMIN_KEY },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intents'] })
      toast({
        title: 'Intent approved!',
        description: `Invite token generated. Share it with the applicant.`,
      })
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (intentId: string) =>
      api.post<RejectIntentResponse>(`/api/admin/intents/${intentId}/reject`, undefined, {
        headers: { 'x-admin-key': ADMIN_KEY },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intents'] })
      toast({
        title: 'Intent rejected',
        description: 'The participation intent has been rejected.',
      })
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const copyToken = async (token: string) => {
    await navigator.clipboard.writeText(token)
    setCopiedToken(token)
    toast({
      title: 'Copied!',
      description: 'Token copied to clipboard',
    })
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const getInviteUrl = (token: string) => {
    return `${window.location.origin}/register?token=${token}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Admin - Manage Intents</CardTitle>
              <CardDescription className="text-gray-400">
                Review and manage participation intents from applicants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-2 mb-6">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}

              {/* Empty State */}
              {!isLoading && data && data.items.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No intents found for this filter
                </div>
              )}

              {/* Intents List */}
              {!isLoading && data && data.items.length > 0 && (
                <div className="space-y-4">
                  {data.items.map((intent) => (
                    <Card key={intent.id} className="bg-gray-700 border-gray-600">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                {intent.fullName}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  intent.status === 'PENDING'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : intent.status === 'APPROVED'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {intent.status}
                              </span>
                            </div>

                            <div className="space-y-1 text-sm text-gray-300">
                              <p>
                                <span className="font-medium">Email:</span> {intent.email}
                              </p>
                              {intent.phone && (
                                <p>
                                  <span className="font-medium">Phone:</span> {intent.phone}
                                </p>
                              )}
                              {intent.notes && (
                                <p>
                                  <span className="font-medium">Notes:</span> {intent.notes}
                                </p>
                              )}
                              <p className="text-gray-400">
                                Submitted: {new Date(intent.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {intent.status === 'PENDING' && (
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => approveMutation.mutate(intent.id)}
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectMutation.mutate(intent.id)}
                                disabled={rejectMutation.isPending}
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Show token after approval */}
                        {intent.status === 'APPROVED' && (
                          <div className="mt-4 p-3 bg-gray-600 rounded-md">
                            <p className="text-xs text-gray-400 mb-1">Registration URL:</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs text-white break-all">
                                {getInviteUrl('TOKEN_HERE')}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="shrink-0"
                              >
                                {copiedToken ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination Info */}
              {data && data.items.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-400">
                  Showing {data.items.length} of {data.total} intents
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
