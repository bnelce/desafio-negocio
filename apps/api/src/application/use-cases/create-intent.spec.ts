import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateIntentUseCase } from './create-intent'
import type { IntentRepository } from '@/application/ports/intent-repository'
import type { Intent } from '@/domain/entities/intent'

describe('CreateIntentUseCase', () => {
  let sut: CreateIntentUseCase
  let intentRepository: IntentRepository

  beforeEach(() => {
    intentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
    } as unknown as IntentRepository

    sut = new CreateIntentUseCase(intentRepository)
  })

  it('should create a new intent successfully', async () => {
    const input = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+5511999999999',
      notes: 'I want to join the group',
    }

    const mockIntent: Intent = {
      id: '123',
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      notes: input.notes,
      status: 'PENDING',
      createdAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    }

    vi.mocked(intentRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(intentRepository.create).mockResolvedValue(mockIntent)

    const result = await sut.execute(input)

    expect(intentRepository.findByEmail).toHaveBeenCalledWith(input.email)
    expect(intentRepository.create).toHaveBeenCalledWith({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      notes: input.notes,
    })
    expect(result.intent).toMatchObject({
      id: mockIntent.id,
      fullName: mockIntent.fullName,
      email: mockIntent.email,
      phone: mockIntent.phone,
      notes: mockIntent.notes,
      status: mockIntent.status,
      reviewedAt: null,
      reviewedBy: null,
    })
    expect(result.intent.createdAt).toBeDefined()
  })

  it('should throw error if email already has pending intent', async () => {
    const input = {
      fullName: 'John Doe',
      email: 'john@example.com',
    }

    const existingIntent: Intent = {
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

    vi.mocked(intentRepository.findByEmail).mockResolvedValue(existingIntent)

    await expect(sut.execute(input)).rejects.toThrow(
      'An intent with this email is already pending review'
    )

    expect(intentRepository.create).not.toHaveBeenCalled()
  })

  it('should allow creating new intent if existing intent is not pending', async () => {
    const input = {
      fullName: 'John Doe',
      email: 'john@example.com',
    }

    const existingIntent: Intent = {
      id: '123',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: null,
      notes: null,
      status: 'APPROVED',
      createdAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: 'admin',
    }

    const newIntent: Intent = {
      id: '456',
      fullName: input.fullName,
      email: input.email,
      phone: null,
      notes: null,
      status: 'PENDING',
      createdAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    }

    vi.mocked(intentRepository.findByEmail).mockResolvedValue(existingIntent)
    vi.mocked(intentRepository.create).mockResolvedValue(newIntent)

    const result = await sut.execute(input)

    expect(result.intent.id).toBe(newIntent.id)
    expect(intentRepository.create).toHaveBeenCalled()
  })

  it('should create intent without optional fields', async () => {
    const input = {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
    }

    const mockIntent: Intent = {
      id: '789',
      fullName: input.fullName,
      email: input.email,
      phone: null,
      notes: null,
      status: 'PENDING',
      createdAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    }

    vi.mocked(intentRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(intentRepository.create).mockResolvedValue(mockIntent)

    const result = await sut.execute(input)

    expect(result.intent.phone).toBeNull()
    expect(result.intent.notes).toBeNull()
  })
})
