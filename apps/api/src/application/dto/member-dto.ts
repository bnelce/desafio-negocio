import { Member, MemberRole, MemberStatus } from '@/domain/entities/member'

export interface MemberDTO {
  id: string
  name: string
  email: string
  phone?: string | null
  role: MemberRole
  status: MemberStatus
  createdAt: Date
  updatedAt: Date
}

export class MemberMapper {
  static toDTO(member: Member): MemberDTO {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      status: member.status,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }
  }
}
