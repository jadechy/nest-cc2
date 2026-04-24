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
            isVerifiedEmail: true,
        },
    });

    const bob = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            password,
            username: 'Bob',
            color: '#00AA00',
            isVerifiedEmail: true,
        },
    });

    const charlie = await prisma.user.create({
        data: {
            email: 'charlie@example.com',
            password,
            username: 'Charlie',
            color: '#0000FF',
            isVerifiedEmail: true,
        },
    });

    const diana = await prisma.user.create({
        data: {
            email: 'diana@example.com',
            password,
            username: 'Diana',
            color: '#FF8800',
            isVerifiedEmail: true,
        },
    });

    const aliceGeneral = await prisma.room.create({
        data: {
            name: 'Général',
            isGeneral: true,
            createdById: alice.id,
            members: {
                create: [
                    { userId: alice.id },
                    { userId: bob.id },
                    { userId: charlie.id },
                    { userId: diana.id },
                ],
            },
        },
    });

    const devRoom = await prisma.room.create({
        data: {
            name: 'Dev',
            createdById: alice.id,
            members: {
                create: [
                    { userId: alice.id },
                    { userId: bob.id },
                    { userId: charlie.id },
                ],
            },
        },
    });

    const designRoom = await prisma.room.create({
        data: {
            name: 'Design',
            createdById: diana.id,
            members: {
                create: [
                    { userId: diana.id },
                    { userId: alice.id },
                ],
            },
        },
    });

    const randomRoom = await prisma.room.create({
        data: {
            name: 'Random',
            createdById: bob.id,
            members: {
                create: [
                    { userId: bob.id },
                    { userId: alice.id },
                    { userId: charlie.id },
                    { userId: diana.id },
                ],
            },
        },
    });

    const directRoom = await prisma.room.create({
        data: {
            name: 'Alice & Bob',
            isDirect: true,
            createdById: alice.id,
            members: {
                create: [
                    { userId: alice.id },
                    { userId: bob.id },
                ],
            },
        },
    });

    const m1 = await prisma.message.create({
        data: { content: 'Bienvenue à tous ! 👋', authorId: alice.id, roomId: aliceGeneral.id },
    });
    const m2 = await prisma.message.create({
        data: { content: 'Merci Alice !', authorId: bob.id, roomId: aliceGeneral.id },
    });
    await prisma.message.create({
        data: { content: 'Ravi d\'être là 😊', authorId: charlie.id, roomId: aliceGeneral.id },
    });

    const m3 = await prisma.message.create({
        data: { content: 'On commence le sprint aujourd\'hui ?', authorId: alice.id, roomId: devRoom.id },
    });
    const m4 = await prisma.message.create({
        data: { content: 'Oui, j\'ai poussé les premières features', authorId: bob.id, roomId: devRoom.id },
    });
    await prisma.message.create({
        data: { content: 'Super, je review ça ce soir', authorId: charlie.id, roomId: devRoom.id },
    });
    await prisma.message.create({
        data: { content: 'N\'oubliez pas les tests 😅', authorId: alice.id, roomId: devRoom.id },
    });

    await prisma.message.create({
        data: { content: 'J\'ai mis à jour les maquettes Figma', authorId: diana.id, roomId: designRoom.id },
    });
    await prisma.message.create({
        data: { content: 'Parfait, je regarde ça maintenant', authorId: alice.id, roomId: designRoom.id },
    });

    await prisma.message.create({
        data: { content: 'Vous avez vu le dernier film Marvel ?', authorId: bob.id, roomId: randomRoom.id },
    });
    await prisma.message.create({
        data: { content: 'Non pas encore ! Pas de spoil 🙏', authorId: diana.id, roomId: randomRoom.id },
    });
    await prisma.message.create({
        data: { content: 'Haha promis 😂', authorId: bob.id, roomId: randomRoom.id },
    });

    const dm1 = await prisma.message.create({
        data: { content: 'Salut Bob, t\'as 5 min ?', authorId: alice.id, roomId: directRoom.id },
    });
    const dm2 = await prisma.message.create({
        data: { content: 'Oui bien sûr, qu\'est-ce qu\'il y a ?', authorId: bob.id, roomId: directRoom.id },
    });
    await prisma.message.create({
        data: { content: 'Je voulais te parler de la PR #42', authorId: alice.id, roomId: directRoom.id },
    });

    await prisma.reaction.createMany({
        data: [
            { emoji: '👍', messageId: m1.id, userId: bob.id },
            { emoji: '👍', messageId: m1.id, userId: charlie.id },
            { emoji: '❤️', messageId: m1.id, userId: diana.id },
            { emoji: '🎉', messageId: m2.id, userId: alice.id },
            { emoji: '👍', messageId: m3.id, userId: bob.id },
            { emoji: '✅', messageId: m4.id, userId: alice.id },
            { emoji: '😂', messageId: dm1.id, userId: bob.id },
            { emoji: '❤️', messageId: dm2.id, userId: alice.id },
        ],
    });

    console.log('Seed terminé ✅');
    console.log('Comptes disponibles :');
    console.log('  alice@example.com / Password123!');
    console.log('  bob@example.com / Password123!');
    console.log('  charlie@example.com / Password123!');
    console.log('  diana@example.com / Password123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });