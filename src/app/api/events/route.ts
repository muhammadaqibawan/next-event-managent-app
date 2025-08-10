import { NextResponse } from "next/server";
import { createEvent } from "@/lib/eventService";
import { auth } from "@/lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const reminder = searchParams.get("reminder");
  const searchTerm = searchParams.get("search") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = {
    userId: session.user.id,
  };

  if (status) filters.status = status;
  if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.gte = new Date(startDate);
    if (endDate) filters.date.lte = new Date(endDate);
  }
  if (reminder === "true") {
    filters.reminders = { some: {} };
  } else if (reminder === "false") {
    filters.reminders = { none: {} };
  }

  // Add search filter on title OR location, case-insensitive partial match
  if (searchTerm.trim() !== "") {
    filters.OR = [
      {
        title: {
          contains: searchTerm.toLowerCase(),
        },
      },
      {
        location: {
          contains: searchTerm.toLowerCase(),
        },
      },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: filters,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        reminders: true,
      },
    }),
    prisma.event.count({ where: filters }),
  ]);

  return NextResponse.json({
    data: events,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const event = await createEvent({ ...body, userId: session.user.id });
  return NextResponse.json(event);
}
