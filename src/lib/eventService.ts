import { prisma } from "./prisma";
import { Event, EventStatus } from "@prisma/client";

export async function getPublicEvents() {
  return prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED },
    orderBy: { date: "asc" },
  });
}

export async function getEventByIdPublic(id: string) {
  return prisma.event.findFirst({
    where: { id, status: EventStatus.PUBLISHED },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

export async function getEventByIdForUser(id: string, userId: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return null;
  if (event.userId !== userId) throw new Error("FORBIDDEN");
  return event;
}

export async function createEvent(data: Omit<Event, "id">) {
  return prisma.event.create({ data });
}

export async function updateEventForUser(
  id: string,
  userId: string,
  data: Partial<Event>
) {
  await getEventByIdForUser(id, userId); // Throws if not allowed
  return prisma.event.update({
    where: { id },
    data,
  });
}

export async function deleteEventForUser(id: string, userId: string) {
  await getEventByIdForUser(id, userId); // Throws if not allowed
  return prisma.event.delete({ where: { id } });
}
