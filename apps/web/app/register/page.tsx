'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { api, ApiError } from '@/lib/api'
import type { ValidateInviteResponse, RegisterMemberInput, RegisterMemberResponse } from '@/lib/types'

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const token = searchParams.get('token')

  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    if (!token) {
      setIsValidating(false)
      setValidationError('No invite token provided')
      return
    }

    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const response = await api.get<ValidateInviteResponse>(`/api/invites/${token}`)

      if (response.valid) {
        setIsValid(true)
      } else {
        setIsValid(false)
        setValidationError(
          response.reason === 'expired' ? 'This invite token has expired' :
          response.reason === 'used' ? 'This invite token has already been used' :
          'This invite token is invalid'
        )
      }
    } catch (error) {
      setIsValid(false)
      setValidationError('Failed to validate token')
    } finally {
      setIsValidating(false)
    }
  }

  const onSubmit = async (data: RegisterForm) => {
    if (!token) return

    try {
      setIsSubmitting(true)

      const { confirmPassword, ...registerData } = data

      await api.post<RegisterMemberResponse>(
        `/api/invites/${token}/register`,
        registerData as RegisterMemberInput
      )

      toast({
        title: 'Registration successful!',
        description: 'Your account has been created. You can now log in.',
      })

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Error registering:', error)

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
          description: 'Failed to register. Please try again.',
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
              <CardTitle className="text-3xl">Complete Your Registration</CardTitle>
              <CardDescription>
                Use your invite token to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isValidating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                  <p className="text-gray-600">Validating your invite token...</p>
                </div>
              ) : !isValid ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid Token</h3>
                  <p className="text-gray-600 text-center mb-6">{validationError}</p>
                  <Link href="/intent">
                    <Button>Submit New Intent</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md mb-6">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">Valid invite token</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register('name')}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
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
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      {...register('password')}
                      disabled={isSubmitting}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      {...register('confirmPassword')}
                      disabled={isSubmitting}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
