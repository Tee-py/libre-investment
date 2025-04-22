import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fundTokens = [
  {
    address: '0x1234567890123456789012345678901234567890',
    chainId: 1, // Ethereum Mainnet
  },
  {
    address: '0x0987654321098765432109876543210987654321',
    chainId: 5, // Goerli
  },
  {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    chainId: 137, // Polygon
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