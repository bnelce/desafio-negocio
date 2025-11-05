import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApproveIntentUseCase } from './approve-intent'
import type { IntentRepository } from '@/application/ports/intent-repository'
import type { InviteRepository } from '@/application/ports/invite-repository'
import type { Intent } from '@/domain/entities/intent'
import type { Invite } from '@/domain/entities/invite'

describe('ApproveIntentUseCase', () => {
  let sut: ApproveIntentUseCase
  let intentRepository: IntentRepository
  let inviteRepository: InviteRepository

  beforeEach(() => {
    intentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
    } as unknown as IntentRepository

    inviteRepository = {
      create: vi.fn(),
      findByToken: vi.fn(),
      findByIntentId: vi.fn(),
      markAsUsed: vi.fn(),
    } as unknown as InviteRepository

    sut = new ApproveIntentUseCase(intentRepository, inviteRepository)
  })

  it('should approve intent and generate invite successfully', async () => {
    const input = {
      intentId: '123',
      reviewedBy: 'admin@example.com',
    }

    const mockIntent: Intent = {
      id: '123',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: null,
      notes: null,
      status: 'PENDING',
      createdAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    }

    const updatedIntent: Intent = {
      ...mockIntent,
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedBy: input.reviewedBy,
    }

    const mockInvite: Invite = {
      id: '456',
      intentId: mockIntent.id,
      token: 'generated-token-123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      createdAt: new Date(),
    }

    vi.mocked(intentRepository.findById).mockResolvedValue(mockIntent)
    vi.mocked(inviteRepository.findByIntentId).mockResolvedValue(null)
    vi.mocked(intentRepository.updateStatus).mockResolvedValue(updatedIntent)
    vi.mocked(inviteRepository.create).mockResolvedValue(mockInvite)

    const result = await sut.execute(input)

    expect(intentRepository.findById).toHaveBeenCalledWith(input.intentId)
    expect(inviteRepository.findByIntentId).toHaveBeenCalledWith(mockIntent.id)
    expect(intentRepository.updateStatus).toHaveBeenCalledWith({
      id: input.intentId,
      status: 'APPROVED',
      reviewedBy: input.reviewedBy,
    })
    expect(inviteRepository.create).toHaveBeenCalled()
    expect(result.intent.status).toBe('APPROVED')
    expect(result.invite.token).toBe(mockInvite.token)
  })

  it('should throw error if intent not found', async () => {
    const input = {
      intentId: '999',
      reviewedBy: 'admin@example.com',
    }

    vi.mocked(intentRepository.findById).mockResolvedValue(null)

    await expect(sut.execute(input)).rejects.toThrow('Intent not found')

    expect(inviteRepository.create).not.toHaveBeenCalled()
  })

  it('should throw error if intent already has invite', async () => {
    const input = {
      intentId: '123',
      reviewedBy: 'admin@example.com',
    }

    const mockIntent: Intent = {
      id: '123',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: null,
      notes: null,
      status: 'PENDING',
      createdAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    }

    const existingInvite: Invite = {
      id: '456',
      intentId: mockIntent.id,
      token: 'existing-token',
      expiresAt: new Date(),
      status: 'PENDING',
      createdAt: new Date(),
    }

    vi.mocked(intentRepository.findById).mockResolvedValue(mockIntent)
    vi.mocked(inviteRepository.findByIntentId).mockResolvedValue(existingInvite)

    await expect(sut.execute(input)).rejects.toThrow('Intent already has an invite')

    expect(intentRepository.updateStatus).not.toHaveBeenCalled()
  })

  it('should throw error if intent cannot be approved (not PENDING)', async () => {
    const input = {
      intentId: '123',
      reviewedBy: 'admin@example.com',
    }

    const mockIntent: Intent = {
      id: '123',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: null,
      notes: null,
      status: 'APPROVED', // Already approved
      createdAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: 'another-admin',
    }

    vi.mocked(intentRepository.findById).mockResolvedValue(mockIntent)
    vi.mocked(inviteRepository.findByIntentId).mockResolvedValue(null)

    await expect(sut.execute(input)).rejects.toThrow('Intent cannot be approved')

    expect(intentRepository.updateStatus).not.toHaveBeenCalled()
  })
})
