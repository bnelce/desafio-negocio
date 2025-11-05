import { PrismaClient } from '@prisma/client'
import { MemberRepository, CreateMemberData } from '@/application/ports/member-repository'
import { Member } from '@/domain/entities/member'

export class PrismaMemberRepository implements MemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMemberData): Promise<Member> {
    const member = await this.prisma.member.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role ?? 'MEMBER',
        status: 'ACTIVE',
      },
    })

    return member
  }

  async findById(id: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: { id },
    })

    return member
  }

  async findByEmail(email: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: { email },
    })

    return member
  }
}
