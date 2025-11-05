import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RegisterWithInviteUseCase } from './register-with-invite'
import type { InviteRepository } from '@/application/ports/invite-repository'
import type { MemberRepository } from '@/application/ports/member-repository'
import type { Invite } from '@/domain/entities/invite'
import type { Member } from '@/domain/entities/member'

describe('RegisterWithInviteUseCase', () => {
  let sut: RegisterWithInviteUseCase
  let inviteRepository: InviteRepository
  let memberRepository: MemberRepository

  beforeEach(() => {
    inviteRepository = {
      create: vi.fn(),
      findByToken: vi.fn(),
      findByIntentId: vi.fn(),
      markAsUsed: vi.fn(),
      updateStatus: vi.fn(),
    } as unknown as InviteRepository

    memberRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
    } as unknown as MemberRepository

    sut = new RegisterWithInviteUseCase(inviteRepository, memberRepository)
  })

  it('should register member with valid invite successfully', async () => {
    const input = {
      token: 'valid-token-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+5511999999999',
      password: 'SecurePass123!',
    }

    const mockInvite: Invite = {
      id: '456',
      intentId: '123',
      token: input.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'PENDING',
      createdAt: new Date(),
    }

    const mockMember: Member = {
      id: '789',
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: 'MEMBER',
      status: 'ACTIVE',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(inviteRepository.findByToken).mockResolvedValue(mockInvite)
    vi.mocked(memberRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(memberRepository.create).mockResolvedValue(mockMember)
    vi.mocked(inviteRepository.updateStatus).mockResolvedValue(undefined)

    const result = await sut.execute(input)

    expect(inviteRepository.findByToken).toHaveBeenCalledWith(input.token)
    expect(memberRepository.findByEmail).toHaveBeenCalledWith(input.email)
    expect(memberRepository.create).toHaveBeenCalledWith({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: expect.any(String), // hashed password
      role: 'MEMBER',
    })
    expect(inviteRepository.updateStatus).toHaveBeenCalledWith({
      id: mockInvite.id,
      status: 'USED',
    })
    expect(result.member.id).toBe(mockMember.id)
    expect(result.member.email).toBe(mockMember.email)
  })

  it('should throw error if invite token is invalid', async () => {
    const input = {
      token: 'invalid-token',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
    }

    vi.mocked(inviteRepository.findByToken).mockResolvedValue(null)

    await expect(sut.execute(input)).rejects.toThrow('Invalid invite token')

    expect(memberRepository.create).not.toHaveBeenCalled()
  })

  it('should throw error if invite is expired', async () => {
    const input = {
      token: 'expired-token',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
    }

    const expiredInvite: Invite = {
      id: '456',
      intentId: '123',
      token: input.token,
      expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'PENDING',
      createdAt: new Date(),
    }

    vi.mocked(inviteRepository.findByToken).mockResolvedValue(expiredInvite)

    await expect(sut.execute(input)).rejects.toThrow('Invite cannot be used: expired')

    expect(memberRepository.create).not.toHaveBeenCalled()
  })

  it('should throw error if invite is already used', async () => {
    const input = {
      token: 'used-token',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
    }

    const usedInvite: Invite = {
      id: '456',
      intentId: '123',
      token: input.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'USED',
      createdAt: new Date(),
    }

    vi.mocked(inviteRepository.findByToken).mockResolvedValue(usedInvite)

    await expect(sut.execute(input)).rejects.toThrow('Invite cannot be used: already used')

    expect(memberRepository.create).not.toHaveBeenCalled()
  })

  it('should throw error if email already exists', async () => {
    const input = {
      token: 'valid-token',
      name: 'John Doe',
      email: 'existing@example.com',
      password: 'SecurePass123!',
    }

    const mockInvite: Invite = {
      id: '456',
      intentId: '123',
      token: input.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      createdAt: new Date(),
    }

    const existingMember: Member = {
      id: '999',
      name: 'Existing User',
      email: input.email,
      phone: null,
      role: 'MEMBER',
      status: 'ACTIVE',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(inviteRepository.findByToken).mockResolvedValue(mockInvite)
    vi.mocked(memberRepository.findByEmail).mockResolvedValue(existingMember)

    await expect(sut.execute(input)).rejects.toThrow('A member with this email already exists')

    expect(memberRepository.create).not.toHaveBeenCalled()
  })

  it('should register member without optional phone', async () => {
    const input = {
      token: 'valid-token',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'SecurePass123!',
    }

    const mockInvite: Invite = {
      id: '456',
      intentId: '123',
      token: input.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      createdAt: new Date(),
    }

    const mockMember: Member = {
      id: '789',
      name: input.name,
      email: input.email,
      phone: null,
      role: 'MEMBER',
      status: 'ACTIVE',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(inviteRepository.findByToken).mockResolvedValue(mockInvite)
    vi.mocked(memberRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(memberRepository.create).mockResolvedValue(mockMember)

    const result = await sut.execute(input)

    expect(result.member.phone).toBeNull()
  })
})
