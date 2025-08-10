// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { addDays, subHours } = require("date-fns");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");
  // Clear all existing data (in correct order due to FK constraints)
  await prisma.reminderLog.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️ Existing data cleared...");

  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      passwordHash: await hash("hashedpassword1", 10),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      passwordHash: await hash("hashedpassword2", 10),
    },
  });

  for (let i = 1; i <= 20; i++) {
    const event = await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        date: addDays(new Date(), i),
        location: "US-NY: New York",
        status: i % 2 === 0 ? "PUBLISHED" : "DRAFT",
        userId: user1.id,
      },
    });

    if (i <= 5) {
      await prisma.reminder.create({
        data: {
          reminderTime: subHours(event.date, 2),
          userId: user1.id,
          eventId: event.id,
        },
      });
    }
  }

  for (let i = 21; i <= 30; i++) {
    const event = await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        date: addDays(new Date(), i),
        location: "PK-LHR: Lahore",
        status: i % 3 === 0 ? "CANCELED" : "PUBLISHED",
        userId: user2.id,
      },
    });

    if (i <= 25) {
      await prisma.reminder.create({
        data: {
          reminderTime: subHours(event.date, 2),
          userId: user2.id,
          eventId: event.id,
        },
      });
    }
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const { PrismaClient } = require("@prisma/client");
// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const { addDays, subHours } = require("date-fns");
// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const { hash } = require("bcryptjs");

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Seeding started...");

//   // Clear all existing data
//   await prisma.reminder.deleteMany();
//   await prisma.event.deleteMany();
//   await prisma.user.deleteMany();

//   console.log("🗑️ Existing data cleared...");

//   // Create test users
//   const user1 = await prisma.user.create({
//     data: {
//       email: "user1@example.com",
//       passwordHash: await hash("hashedpassword1", 10),
//     },
//   });

//   const user2 = await prisma.user.create({
//     data: {
//       email: "user2@example.com",
//       passwordHash: await hash("hashedpassword2", 10),
//     },
//   });

//   // Events + Reminders for user1
//   for (let i = 1; i <= 5; i++) {
//     const event = await prisma.event.create({
//       data: {
//         title: `Event ${i}`,
//         description: `Description for Event ${i}`,
//         date: addDays(new Date(), i), // future events
//         location: "US-NY: New York",
//         status: i % 2 === 0 ? "PUBLISHED" : "DRAFT",
//         userId: user1.id,
//       },
//     });

//     // 1st two reminders set to now, rest are in future
//     const reminderTime =
//       i <= 2
//         ? new Date() // <-- Changed to now for immediate testing
//         : subHours(event.date, 2); // future

//     await prisma.reminder.create({
//       data: {
//         reminderTime,
//         userId: user1.id,
//         eventId: event.id,
//       },
//     });
//   }

//   // Events + Reminders for user2
//   for (let i = 6; i <= 10; i++) {
//     const event = await prisma.event.create({
//       data: {
//         title: `Event ${i}`,
//         description: `Description for Event ${i}`,
//         date: addDays(new Date(), i), // future events
//         location: "PK-LHR: Lahore",
//         status: i % 3 === 0 ? "CANCELED" : "PUBLISHED",
//         userId: user2.id,
//       },
//     });

//     // First reminder set to now, rest are in future
//     const reminderTime =
//       i === 6
//         ? new Date() // <-- Changed to now for immediate testing
//         : subHours(event.date, 2); // future

//     await prisma.reminder.create({
//       data: {
//         reminderTime,
//         userId: user2.id,
//         eventId: event.id,
//       },
//     });
//   }

//   console.log("✅ Seed complete — test reminders ready");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(() => prisma.$disconnect());
