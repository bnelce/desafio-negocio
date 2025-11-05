import { Member } from '@/domain/entities/member'

export interface CreateMemberData {
  name: string
  email: string
  phone?: string
  password: string
  role?: 'ADMIN' | 'MEMBER'
}

export interface MemberRepository {
  create(data: CreateMemberData): Promise<Member>
  findById(id: string): Promise<Member | null>
  findByEmail(email: string): Promise<Member | null>
}
