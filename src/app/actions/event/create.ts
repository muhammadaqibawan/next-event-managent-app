"use server";

import { prisma } from "@/lib/prisma";
import {
  createEventSchema,
  CreateEventFormInput,
} from "@/lib/validations/event";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const REMINDER_OFFSETS: Record<string, number> = {
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "2h": 2 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export async function createEvent(
  data: CreateEventFormInput & { reminder?: string }
) {
  console.log("reminder and data", data)
  const parsed = createEventSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
    });

    const error = new Error("Validation error");
    (error as any).fieldErrors = fieldErrors;
    throw error;
  }

  const { reminder, ...eventData } = parsed.data;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  // Unique constraint check
  const exists = await prisma.event.findFirst({
    where: {
      userId,
      title: eventData.title,
      date: eventData.date,
    },
  });

  if (exists) {
    throw new Error("You already have an event with this title and date.");
  }

  // Transaction: create event + reminder if needed
  await prisma.$transaction(async (tx) => {
    const createdEvent = await tx.event.create({
      data: {
        userId,
        ...eventData,
      },
    });

    if (reminder && reminder !== "none") {
      const offset = REMINDER_OFFSETS[reminder];
      if (!offset) throw new Error("Invalid reminder option");

      const eventDate = new Date(eventData.date); 
      const reminderTime = new Date(eventDate.getTime() - offset);

      if (reminderTime > new Date()) {
        await tx.reminder.create({
          data: {
            reminderTime,
            eventId: createdEvent.id,
            userId,
          },
        });
      }
    }
  });

  return { success: true };
}
