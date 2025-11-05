'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { api, ApiError } from '@/lib/api'
import type { CreateIntentInput, CreateIntentResponse } from '@/lib/types'

const intentSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type IntentForm = z.infer<typeof intentSchema>

export default function IntentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntentForm>({
    resolver: zodResolver(intentSchema),
  })

  const onSubmit = async (data: IntentForm) => {
    try {
      setIsSubmitting(true)

      const response = await api.post<CreateIntentResponse>('/api/intents', data as CreateIntentInput)

      toast({
        title: 'Success!',
        description: 'Your participation intent has been submitted successfully. An admin will review it soon.',
      })

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Error submitting intent:', error)

      if (error instanceof ApiError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to submit intent. Please try again.',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Submit Participation Intent</CardTitle>
              <CardDescription>
                Fill out the form below to express your interest in joining our networking group.
                An admin will review your submission and get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register('fullName')}
                    disabled={isSubmitting}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    {...register('phone')}
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us why you want to join..."
                    {...register('notes')}
                    disabled={isSubmitting}
                  />
                  {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Intent'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
