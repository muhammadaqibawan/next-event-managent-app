"use server";

import { prisma } from "@/lib/prisma";
export async function deleteEvent(eventId: string) {
  try {
    await prisma.event.delete({
      where: { id: eventId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete event error:", error);
    return {
      success: false,
      message: "Unable to delete the event. It may not exist.",
    };
  }
}
