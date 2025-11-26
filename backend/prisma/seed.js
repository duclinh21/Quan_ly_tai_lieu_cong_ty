const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Tạo Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator - Full access'
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular User'
    }
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Manager - Department access'
    }
  })

  console.log('✅ Roles created:', { adminRole, userRole, managerRole })

  // Tạo admin user mặc định (nếu chưa có)
  const hasAdmin = await prisma.user.findFirst({
    where: { email: 'admin@dms.com' }
  })

  if (!hasAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@dms.com',
        username: 'admin',
        password: hashedPassword,
        fullName: 'Administrator',
        roleId: adminRole.id
      }
    })
    console.log('✅ Admin user created:', adminUser.email, 'Password: admin123')
  } else {
    console.log('ℹ️  Admin user already exists')
  }

  // Tạo một số Categories mẫu
  const categories = [
    { name: 'Hợp đồng', description: 'Các loại hợp đồng' },
    { name: 'Quy trình', description: 'Quy trình làm việc' },
    { name: 'Chính sách', description: 'Chính sách công ty' },
    { name: 'Báo cáo', description: 'Báo cáo định kỳ' }
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    })
  }
  console.log('✅ Sample categories created')

  // Tạo một số Departments mẫu
  const departments = [
    { name: 'Phòng Nhân sự', description: 'Phòng ban quản lý nhân sự' },
    { name: 'Phòng Kế toán', description: 'Phòng ban kế toán tài chính' },
    { name: 'Phòng Kỹ thuật', description: 'Phòng ban kỹ thuật công nghệ' },
    { name: 'Phòng Kinh doanh', description: 'Phòng ban kinh doanh' }
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept
    })
  }
  console.log('✅ Sample departments created')

  console.log('✨ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

