import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fundTokens = [
  {
    address: '0xcDF53d6fbd1d92FB623765D863eDB1604D77E636',
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