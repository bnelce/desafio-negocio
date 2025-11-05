import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await argon2.hash('Admin@123')

  const admin = await prisma.member.upsert({
    where: { email: 'admin@networkinggroups.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@networkinggroups.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create some sample intents for testing
  const intent1 = await prisma.intent.create({
    data: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      notes: 'Interested in joining the networking group',
      status: 'PENDING',
    },
  })

  console.log('✅ Sample intent created:', intent1.email)

  const intent2 = await prisma.intent.create({
    data: {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      notes: 'Looking forward to networking opportunities',
      status: 'PENDING',
    },
  })

  console.log('✅ Sample intent created:', intent2.email)

  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
