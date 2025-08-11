import { createEvent } from "@/app/actions/event/create";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

jest.mock("@auth/prisma-adapter", () => {
  return {
    PrismaAdapter: jest.fn(),
  };
});

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    reminder: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockedGetServerSession = getServerSession as jest.Mock;
const mockedFindFirst = prisma.event.findFirst as jest.Mock;
const mockedTransaction = prisma.$transaction as jest.Mock;

describe("createEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an event and reminder when valid data is passed", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: "user123" },
    });

    mockedFindFirst.mockResolvedValue(null);

    mockedTransaction.mockImplementation(async (callback) => {
      return callback({
        event: {
          create: jest.fn().mockResolvedValue({ id: "event123" }),
        },
        reminder: {
          create: jest.fn().mockResolvedValue({}),
        },
      } as any);
    });

    const result = await createEvent({
      title: "Test Event",
      date: new Date(Date.now() + 2 * 60 * 60 * 1000),
      location: "US-NY: Test Location",
      status: "PUBLISHED",
      description: "Test description",
      reminder: "1h",
    });

    expect(result).toEqual({ success: true });
  });

  it("should throw a validation error for invalid input", async () => {
    await expect(
      createEvent({
        title: "", // invalid
        date: "invalid-date" as any,
        location: "", // invalid
        status: "PUBLISHED",
        description: "test",
      })
    ).rejects.toThrow("Validation error");
  });

  it("should throw an error if user is not logged in", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    await expect(
      createEvent({
        title: "Test Event",
        date: new Date(Date.now() + 2 * 60 * 60 * 1000),
        location: "US-NY: Test Location",
        status: "DRAFT",
        description: "test",
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("should throw an error if event with same title and date already exists", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: "user123" },
    });

    mockedFindFirst.mockResolvedValue({ id: "existingEvent" });

    await expect(
      createEvent({
        title: "Test Event",
        date: new Date(Date.now() + 2 * 60 * 60 * 1000),
        location: "US-NY: Test Location",
        status: "DRAFT",
        description: "test",
      })
    ).rejects.toThrow("You already have an event with this title and date.");
  });

  // Skip it for now: TODO
  it.skip("throws error for reminder option missing offset in REMINDER_OFFSETS", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: "user123" },
    });

    mockedFindFirst.mockResolvedValue(null);

    mockedTransaction.mockImplementation(async (callback) => {
      return callback({
        event: {
          create: jest.fn().mockResolvedValue({ id: "event123" }),
        },
        reminder: {
          create: jest.fn(),
        },
      } as any);
    });

    await expect(
      createEvent({
        title: "Test Event",
        date: new Date(Date.now() + 2 * 60 * 60 * 1000),
        location: "US-NY: Online",
        status: "PUBLISHED",
        description: "test description",
        reminder: "8h" as any,
      })
    ).rejects.toThrow("Invalid reminder option");
  });

  // Skip this test. TODO
  it.skip("creates event but skips reminder if reminderTime is in the past", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: "user123" },
    });

    mockedFindFirst.mockResolvedValue(null);

    mockedTransaction.mockImplementation(async (callback) => {
      const reminderCreateMock = jest.fn();
      return callback({
        event: {
          create: jest.fn().mockResolvedValue({ id: "event123" }),
        },
        reminder: {
          create: reminderCreateMock,
        },
      } as any);
    });

    const pastDate = new Date(Date.now() + 10 * 60 * 1000);
    const result = await createEvent({
      title: "Test Event",
      date: pastDate,
      location: "US-NY: Online",
      status: "PUBLISHED",
      description: "test description",
      reminder: "1h",
    });

    expect(result).toEqual({ success: true });
  });
});
