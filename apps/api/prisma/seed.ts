import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10)
  const demoUser = await prisma.user.upsert({
    where: { id: "demo-user-1" },
    update: {},
    create: {
      id: "demo-user-1",
      fullName: "Demo User",
      email: "demo@example.com",
      passwordHash,
      age: 30,
      gender: "male",
      dietaryPreference: "halal",
      heightCm: 175,
      weightKg: 75,
      activityLevel: "moderate",
      dailyCalorieGoal: 2600
    }
  })

  await prisma.userPrefs.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      halalCheckEnabled: true,
      lowSodiumMgLimit: 200,
      lowSugarGlimit: 10,
      lowCarbGlimit: 30,
      lowCalorieLimit: 200,
      highProteinGtarget: 10,
      vegetarian: false,
      vegan: false,
      sensitiveStomach: true
    }
  })

  // Promote super admin
  const adminEmail = "miqbal@dccdialysis.com"
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existingAdmin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "SUPER_ADMIN" }
    })
    console.log(`Promoted ${adminEmail} to SUPER_ADMIN`)
  } else {
    const adminHash = await bcrypt.hash("admin1234", 10)
    await prisma.user.create({
      data: {
        fullName: "M Iqbal",
        email: adminEmail,
        passwordHash: adminHash,
        role: "SUPER_ADMIN",
        dailyCalorieGoal: 2000,
        planName: "free",
        scanLimit: 10,
        scansUsed: 0,
        billingStartDate: new Date(),
        planExpiresAt: null
      }
    })
    console.log(`Created ${adminEmail} as SUPER_ADMIN`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
