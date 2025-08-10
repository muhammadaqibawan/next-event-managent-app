"use client";

import { useRouter } from "next/navigation";
import EventForm from "../../../../components/EventForm";
import { updateEvent } from "@/app/actions/event/update";
import type { CreateEventFormInput } from "@/lib/validations/event";
import { formatLocalDateTime } from "@/lib/utils";
import { useInvalidateEvents } from "@/hooks/useInvalidateEvents";
import { ROUTES } from "@/constants/routes";

export default function EventFormWrapper({
  event,
}: {
  event: CreateEventFormInput & { id: string };
}) {
  const router = useRouter();
  const invalidateEvents = useInvalidateEvents();

  async function handleSubmit(data: CreateEventFormInput) {
    await updateEvent(event.id, data);
    invalidateEvents();
    router.push(ROUTES.DASHBOARD);
  }

  return (
    <EventForm
      mode="edit"
      defaultValues={{
        ...event,
        date: formatLocalDateTime(event.date as string),
      }}
      onSubmitOverride={handleSubmit}
    />
  );
}
