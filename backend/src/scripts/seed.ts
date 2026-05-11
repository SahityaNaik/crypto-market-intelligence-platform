import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting official database seeding...');

  // 1. Ensure Demo User exists  
  const demoEmail = 'demo@kuvaka.io';
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      password: hashedPassword,
      name: 'Kuvaka Demo User',
    },
  });

  console.log(`✅ Demo account ready: ${demoUser.email}`);

  // 2. Add historical price data (for charts)
  const coinIds = [
    'bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano',
    'solana', 'polkadot', 'dogecoin', 'tron', 'chainlink',
    'shiba-inu', 'avalanche-2'
  ];

  const priceHistoryCount = await prisma.priceHistory.count();
  if (priceHistoryCount === 0) {
    console.log('📊 Generating sample price history for the dashboard...');

    for (const coinId of coinIds) {
      // Set a realistic base price
      let basePrice = 100;
      if (coinId === 'bitcoin') basePrice = 65000;
      else if (coinId === 'ethereum') basePrice = 3500;
      else if (coinId === 'binancecoin') basePrice = 600;
      else if (coinId === 'solana') basePrice = 150;

      // Create 24 hours of data points
      for (let i = 24; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
        // Add some random price movement (+/- 3%)
        const randomVariation = 1 + (Math.random() * 0.06 - 0.03);

        await prisma.priceHistory.create({
          data: {
            coinId,
            price: basePrice * randomVariation,
            timestamp
          }
        });
      }
    }
    console.log('✅ 24h price history generated for all coins.');
  }

  // 3. Add a sample portfolio for the demo user (if empty)
  const portfolioCount = await prisma.portfolioPosition.count({ where: { userId: demoUser.id } });
  if (portfolioCount === 0) {
    console.log('💼 Adding sample portfolio for demo account...');

    const samplePositions = [
      { coinId: 'bitcoin', quantity: 0.5, purchasePrice: 62000 },
      { coinId: 'ethereum', quantity: 5, purchasePrice: 3200 },
      { coinId: 'chainlink', quantity: 100, purchasePrice: 15 }
    ];

    for (const pos of samplePositions) {
      await prisma.portfolioPosition.create({
        data: {
          ...pos,
          userId: demoUser.id
        }
      });
    }
    console.log('✅ Sample portfolio created.');
  }

  console.log('🏁 Seeding complete! The app is now ready for demo.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
