import * as z from "zod";

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

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Max 100 characters"),
    description: z.string().max(500, "Max 500 characters").optional(),
    date: z.preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date().refine((date) => date > new Date(), {
        message: "Date must be in the future",
      })
    ),
    location: z
      .string()
      .regex(
        /^[A-Z]{2}-[A-Z]{2}:.+/,
        "Location must start with country code prefix, e.g., US-NY: New York"
      ),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELED"]),
    reminder: z
      .enum(["none", "15m", "30m", "1h", "2h", "6h", "1d", "3d", "7d"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { date, reminder } = data;

    if (!reminder || reminder === "none") return; // No reminder selected

    const offset = REMINDER_OFFSETS[reminder];
    if (!offset || !(date instanceof Date)) return;

    const now = new Date();
    const minimumEventTime = new Date(now.getTime() + offset);

    if (date.getTime() < minimumEventTime.getTime()) {
      ctx.addIssue({
        path: ["reminder"],
        code: z.ZodIssueCode.custom,
        message: `Event must be at least ${reminder} from now to use this reminder.`,
      });
    }
  });

export type CreateEventFormInput = z.input<typeof createEventSchema>;
