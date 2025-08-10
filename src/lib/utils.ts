import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLocalDateTime(isoString: string): string {
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function getReminderKeyFromTimes(
  eventDate: string,
  reminderTime: string
) {
  if (!reminderTime) return "none";

  const diffMs =
    new Date(eventDate).getTime() - new Date(reminderTime).getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  switch (diffMinutes) {
    case 15:
      return "15m";
    case 30:
      return "30m";
    case 60:
      return "1h";
    case 120:
      return "2h";
    case 360:
      return "6h";
    case 1440:
      return "1d";
    case 4320:
      return "3d";
    case 10080:
      return "7d";
    default:
      return "none";
  }
}

export function getEventLabel(dateStr: string): {
  text: string;
  color: string;
} {
  const now = new Date();
  const date = new Date(dateStr);
  const diffInDays = Math.floor(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays < 0) return { text: "Past", color: "bg-red-500" };
  if (diffInDays <= 14) return { text: "New", color: "bg-green-400" };
  return { text: "Upcoming", color: "bg-yellow-400" };
}
