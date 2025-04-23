import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fundTokens = [
  {
    address: '0x0987654321098765432109876543210987654321',
    chainId: 84532, // Base Sepolia
  },
  {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    chainId: 80002, // Polygon Amoy
  },
];

async function main() {
  console.log('🌱 Starting seeding...');

  // Delete existing data
  await prisma.fundToken.deleteMany();
  console.log('🗑️ Deleted existing fund tokens');

  // Create new fund tokens
  for (const token of fundTokens) {
    await prisma.fundToken.create({
      data: token,
    });
    console.log(`✅ Created fund token: ${token.address} on chain ${token.chainId}`);
  }

  console.log('🌱 Seeding finished');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 