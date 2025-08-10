import ViewEventDetail from "../../../../components/ViewEventDetail";
import { getEventById } from "@/app/actions/event/view";

type Params = {
  params: { id: string };
};

function formatLocalDateTime(isoString: string): string {
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default async function ViewEventPage({ params }: Params) {
  const event = await getEventById(params.id);

  if (!event) {
    return (
      <div className="text-center text-red-600 mt-20">Event not found.</div>
    );
  }

  const normalizedEvent = {
    ...event,
    date: formatLocalDateTime(event.date),
  };

  return (
    <main className="p-6">
      <ViewEventDetail event={normalizedEvent} />
    </main>
  );
}
