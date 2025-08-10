import { getPublicEvents } from "@/lib/eventService";
import Header from "./components/event/Header";
import Item from "./components/event/Item";
import { Event } from "./types/event";

export default async function EventsPage() {
  const eventsData = await getPublicEvents();

  const events: Event[] = eventsData.map((event) => ({
    id: event.id,
    title: event.title,
    date: new Date(event.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 p-6 sm:p-12 flex flex-col items-center">
      <Header />
      <main className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <Item event={event} key={event.id} />
        ))}
      </main>
    </div>
  );
}
