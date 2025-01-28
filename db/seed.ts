import {PrismaClient} from '@prisma/client';
import sampleData from './sample-data';

async function main() {
    const prisma = new PrismaClient();
    await prisma.product.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    // Create products using sampleData.products
    await prisma.product.createMany({ data: sampleData.products });

    // Create users using sampleData.users
    await prisma.user.createMany({ data: sampleData.users });

    console.log('Database seeded successfully');
}

main();

