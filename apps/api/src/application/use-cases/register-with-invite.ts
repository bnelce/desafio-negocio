import { InviteRepository } from '@/application/ports/invite-repository'
import { MemberRepository } from '@/application/ports/member-repository'
import { MemberDTO, MemberMapper } from '@/application/dto/member-dto'
import { HashService } from '@/application/services/hash-service'
import { InviteEntity } from '@/domain/entities/invite'

export interface RegisterWithInviteInput {
  token: string
  name: string
  email: string
  phone?: string
  password: string
}

export interface RegisterWithInviteOutput {
  member: MemberDTO
}

export class RegisterWithInviteUseCase {
  constructor(
    private readonly inviteRepository: InviteRepository,
    private readonly memberRepository: MemberRepository
  ) {}

  async execute(input: RegisterWithInviteInput): Promise<RegisterWithInviteOutput> {
    // Find and validate invite
    const invite = await this.inviteRepository.findByToken(input.token)

    if (!invite) {
      throw new Error('Invalid invite token')
    }

    const inviteEntity = new InviteEntity(invite)

    if (!inviteEntity.canBeUsed()) {
      const reason = inviteEntity.isUsed() ? 'already used' : 'expired'
      throw new Error(`Invite cannot be used: ${reason}`)
    }

    // Check if email already exists
    const existingMember = await this.memberRepository.findByEmail(input.email)

    if (existingMember) {
      throw new Error('A member with this email already exists')
    }

    // Hash password
    const hashedPassword = await HashService.hash(input.password)

    // Create member
    const member = await this.memberRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      role: 'MEMBER',
    })

    // Mark invite as used
    await this.inviteRepository.updateStatus({
      id: invite.id,
      status: 'USED',
    })

    return {
      member: MemberMapper.toDTO(member),
    }
  }
}
