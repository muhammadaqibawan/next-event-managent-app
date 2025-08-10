import EventFormWrapper from "./EventFormWrapper"
import { getReminderKeyFromTimes } from "@/lib/utils"

type Params = { params: { id: string } };



export default async function CreateEventPage({ params }: Params) {
const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
    reminders: true, // or select specific fields
  },
  });

  if (!event) {
    return <p className="text-center text-red-600">Event not found.</p>;
  }
  let reminderTime;
  if(event.reminders && event.reminders.length > 0){
    reminderTime = getReminderKeyFromTimes(event.date, event.reminders[0].reminderTime)
  }
  return (
    <main className="p-6">
      <EventFormWrapper event={{...event, reminder: reminderTime ?? undefined}} />
    </main>
  );
}
