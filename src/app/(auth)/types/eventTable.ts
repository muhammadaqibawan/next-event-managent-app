export type Reminder = {
  id: string;
  reminderTime: string; // ISO string of reminder datetime
  eventId: string;
  userId: string;
  createdAt: string;
};

export type Event = {
  id: string;
  title: string;
  date: string; // ISO string
  location: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
  reminders: Reminder[];
};

export type EventListResponse = {
  data: Event[];
  meta: {
    total: number;
  };
};
