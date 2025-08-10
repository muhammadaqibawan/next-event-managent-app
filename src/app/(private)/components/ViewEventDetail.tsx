"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import React from "react";
import { ROUTES } from "@/constants/routes";

type ViewEventDetailProps = {
  event: {
    title: string;
    description?: string;
    date: string;
    location: string;
    status: "DRAFT" | "PUBLISHED" | "CANCELED";
  };
};

export default function ViewEventDetail({ event }: ViewEventDetailProps) {
  const router = useRouter();

  return (
    <section className="w-full max-w-4xl mx-auto space-y-10 bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      </div>

      {/* Unified Header Design */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-md p-6 shadow-xl text-white text-center">
        <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-md select-none">
          📄 Event Details
        </h1>
        <p className="mt-2 text-pink-100 font-medium max-w-2xl mx-auto text-lg">
          Here's the detailed view of your event.
        </p>
      </header>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-800">
        {/* Title */}
        <div>
          <p className="text-sm font-semibold text-gray-500">Title</p>
          <p className="text-lg font-bold">{event.title}</p>
        </div>

        {/* Date */}
        <div>
          <p className="text-sm font-semibold text-gray-500">Date & Time</p>
          <p className="text-lg font-bold">
            {new Date(event.date).toLocaleString()}
          </p>
        </div>

        {/* Location */}
        <div>
          <p className="text-sm font-semibold text-gray-500">Location</p>
          <p className="text-lg font-bold">{event.location}</p>
        </div>

        {/* Status */}
        <div>
          <p className="text-sm font-semibold text-gray-500">Status</p>
          <span
            className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${
              event.status === "PUBLISHED"
                ? "bg-green-100 text-green-700"
                : event.status === "DRAFT"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {event.status}
          </span>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-gray-500">Description</p>
          <p className="text-base mt-1 text-gray-700">
            {event.description || "No description."}
          </p>
        </div>
      </div>
    </section>
  );
}
