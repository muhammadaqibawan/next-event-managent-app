import React from "react";
import { Event } from "../../types/event";
import { getEventLabel } from "@/lib/utils";

interface EventItemProps {
  event: Event;
}

export default function Item({ event }: EventItemProps) {
  const { text, color } = getEventLabel(event.date);

  return (
    <article
      className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-8 shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-yellow-400/70 cursor-pointer focus-within:ring-2 focus-within:ring-yellow-300"
      tabIndex={0}
      role="button"
      aria-label={`Event: ${event.title}`}
    >
      <div
        className={`absolute -top-4 -right-4 ${color} text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg`}
      >
        {text}
      </div>

      <h2 className="text-white text-3xl font-extrabold mb-3 drop-shadow-md">
        {event.title}
      </h2>
      <p className="text-yellow-200 font-semibold">{event.date}</p>
      <div className="mt-4 h-1 w-16 bg-yellow-300 rounded-full animate-pulse" />
    </article>
  );
}
