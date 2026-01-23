import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { id: "demo-user-1" },
    update: {},
    create: { id: "demo-user-1", name: "Demo User" }
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
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
