"use server";

import { prisma } from "@/lib/prisma";
import {
  createEventSchema,
  CreateEventFormInput,
} from "@/lib/validations/event";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ZodIssue } from "zod";

/**
 * Accepts CreateEventFormInput plus optional `reminder?: string`
 * where reminder is one of: "none","15m","30m","1h","2h","6h","1d","3d","7d"
 */
export async function updateEvent(
  id: string,
  data: CreateEventFormInput & { reminder?: string }
) {
  // 1) Validation
  const parsed = createEventSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue: ZodIssue) => {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
    });
    const error = new Error("Validation error");
    (error as any).fieldErrors = fieldErrors;
    throw error;
  }
  const eventData = parsed.data;

  // 2) Auth & ownership
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Ensure the event exists and belongs to the current user
  const existingEvent = await prisma.event.findUnique({
    where: { id },
    select: { id: true, userId: true, date: true, title: true },
  });
  if (!existingEvent) throw new Error("Event not found");
  if (existingEvent.userId !== userId) throw new Error("Forbidden");

  // 3) Unique constraint: ensure no other event (same user) with same title+date
  const duplicate = await prisma.event.findFirst({
    where: {
      userId,
      title: eventData.title,
      date: eventData.date,
      NOT: { id },
    },
  });
  if (duplicate) {
    throw new Error("You already have an event with this title and date.");
  }

  // 4) Reminder offset map (milliseconds)
  const REMINDER_OFFSETS: Record<string, number> = {
    none: 0,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "2h": 2 * 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "3d": 3 * 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };

  const reminderKey = data.reminder ?? "none";
  const offsetMs = REMINDER_OFFSETS[reminderKey];

  // 5) Transaction: update event and adjust reminder (create/update/delete)
  const now = new Date();
  const updatedEvent = await prisma.$transaction(async (tx) => {
    const ev = await tx.event.update({
      where: { id },
      data: {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        status: eventData.status,
      },
    });

    // handle reminder logic
    if (reminderKey && reminderKey !== "none") {
      if (offsetMs === undefined) {
        throw new Error("Invalid reminder option");
      }

      const computedReminderTime = new Date(ev.date.getTime() - offsetMs);

      if (computedReminderTime <= now) {
        // If reminder would be in the past, remove any existing reminder (per constraint)
        await tx.reminder.deleteMany({
          where: { eventId: id, userId },
        });
        // Optionally we could return a warning back to the client. For now, it's deletion.
      } else {
        // Upsert reminder (uses composite unique eventId_userId)
        await tx.reminder.upsert({
          where: {
            eventId_userId: { eventId: id, userId },
          },
          update: { reminderTime: computedReminderTime },
          create: {
            reminderTime: computedReminderTime,
            eventId: id,
            userId,
          },
        });
      }
    } else {
      // "none" - delete any existing reminder for this event+user
      await tx.reminder.deleteMany({
        where: { eventId: id, userId },
      });
    }

    return ev;
  });

  return { success: true, event: updatedEvent };
}
