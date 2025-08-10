"use server";

import { prisma } from "@/lib/prisma";

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) return null;

  return {
    title: event.title,
    description: event.description ?? undefined,
    date: event.date.toISOString(),
    location: event.location,
    status: event.status,
  };
}
