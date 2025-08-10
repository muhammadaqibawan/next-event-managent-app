(async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cron = require("node-cron");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dayjs = require("dayjs");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const relativeTime = require("dayjs/plugin/relativeTime");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");

  dayjs.extend(relativeTime);
  const prisma = new PrismaClient();

  cron.schedule("* * * * *", async () => {
    console.log(`[CRON] Checking reminders at ${new Date().toISOString()}`);

    const now = new Date();
    const oneMinuteAgo = dayjs(now).subtract(1, "minute");

    const upcomingReminders = await prisma.reminder.findMany({
      include: {
        event: { include: { user: true } },
        user: true,
      },
    });

    for (const reminder of upcomingReminders) {
      const reminderTime = dayjs(reminder.reminderTime);

      if (
        reminderTime.isAfter(oneMinuteAgo) &&
        reminderTime.isBefore(dayjs(now).add(1, "second")) // Add buffer for slight delay
      ) {
        const relative = dayjs(reminder.event.date).fromNow();
        const logMessage = `[REMINDER] Event: ${reminder.event.title}, User: ${reminder.userId}, Time: ${relative}`;

        await prisma.reminderLog.create({
          data: {
            eventId: reminder.eventId,
            userId: reminder.userId,
            message: logMessage,
            reminderType: "AUTO",
          },
        });

        console.log(logMessage);
      }
    }
  });

  console.log("[CRON] Reminder job scheduled");
})();
