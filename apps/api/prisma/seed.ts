import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    const password = await hash('Password123!', 10);

    await prisma.reaction.deleteMany();
    await prisma.message.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    const alice = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            password,
            username: 'Alice',
            color: '#FF0000',
        },
    });

    const bob = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            password,
            username: 'Bob',
            color: '#00FF00',
        },
    });

    const generalRoom = await prisma.room.create({
        data: {
            name: 'Général',
            isGeneral: true,
            createdById: alice.id,
        },
    });

    const randomRoom = await prisma.room.create({
        data: {
            name: 'Random',
            createdById: bob.id,
        },
    });

    await prisma.roomMember.createMany({
        data: [
            { userId: alice.id, roomId: generalRoom.id },
            { userId: bob.id, roomId: generalRoom.id },
            { userId: alice.id, roomId: randomRoom.id },
            { userId: bob.id, roomId: randomRoom.id },
        ],
    });

    const message1 = await prisma.message.create({
        data: {
            content: 'Bonjour tout le monde !',
            authorId: alice.id,
            roomId: generalRoom.id,
        },
    });

    const message2 = await prisma.message.create({
        data: {
            content: 'Salut Alice !',
            authorId: bob.id,
            roomId: generalRoom.id,
        },
    });

    await prisma.reaction.create({
        data: {
            emoji: '👍',
            messageId: message1.id,
            userId: bob.id,
        },
    });

    await prisma.reaction.create({
        data: {
            emoji: '❤️',
            messageId: message2.id,
            userId: alice.id,
        },
    });

    console.log('Seed terminé ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });