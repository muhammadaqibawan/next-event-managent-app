"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEventSchema,
  CreateEventFormInput,
} from "@/lib/validations/event";
import { createEvent } from "@/app/actions/event/create";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";

import { ArrowLeft } from "lucide-react";
import { useInvalidateEvents } from "@/hooks/useInvalidateEvents";

type Props = {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateEventFormInput>;
  onSubmitOverride?: (data: CreateEventFormInput) => Promise<void>;
};

export default function EventForm({
  mode,
  defaultValues,
  onSubmitOverride,
}: Props) {
  console.log("defaultValues", defaultValues);
  const router = useRouter();
  const invalidateEvents = useInvalidateEvents();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateEventFormInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      status: "DRAFT",
      reminder: "none",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        title: defaultValues.title ?? "",
        description: defaultValues.description ?? "",
        date: defaultValues.date ?? undefined,
        location: defaultValues.location ?? "",
        status: defaultValues.status ?? "DRAFT",
      });
    }
  }, [defaultValues, form]);

  async function onSubmit(data: CreateEventFormInput) {
    setFormError(null);
    setIsLoading(true);

    try {
      if (onSubmitOverride) {
        await onSubmitOverride(data);
        return;
      } else {
        await createEvent(data); // create by default
      }
      invalidateEvents();
      router.push(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.log(error.message);
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([key, message]) => {
          form.setError(key as keyof CreateEventFormInput, { message });
        });
      } else {
        setFormError(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-4xl mx-auto space-y-10 bg-white border border-gray-200 rounded-lg p-8 shadow-lg"
      >
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(ROUTES.DASHBOARD)}
            type="button"
            className="inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-md p-6 shadow-xl text-white text-center">
          <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-md select-none">
            {mode === "edit" ? "✏️ Edit Event" : "🎉 Create New Event"}
          </h1>
          <p className="mt-2 text-pink-100 font-medium max-w-2xl mx-auto text-lg">
            {mode === "edit"
              ? "Update your event details below."
              : "Fill out the details below to add a new event."}
          </p>
        </header>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Event title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date and Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value as string}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. US-NY: New York" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="CANCELED">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reminder */}
          <FormField
            control={form.control}
            name="reminder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined} // Important: show placeholder if no value
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No reminder</SelectItem>
                    <SelectItem value="15m">15 minutes before</SelectItem>
                    <SelectItem value="30m">30 minutes before</SelectItem>
                    <SelectItem value="1h">1 hour before</SelectItem>
                    <SelectItem value="2h">2 hours before</SelectItem>
                    <SelectItem value="6h">6 hours before</SelectItem>
                    <SelectItem value="1d">1 day before</SelectItem>
                    <SelectItem value="3d">3 days before</SelectItem>
                    <SelectItem value="7d">7 days before</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description - Full Width */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full border rounded-md p-2 resize-none"
                      placeholder="Optional description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Form Errors */}
        {formError && (
          <p className="text-red-600 font-semibold text-center">{formError}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r cursor-pointer from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
        >
          {isLoading
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update Event"
            : "Create Event"}
        </Button>
      </form>
    </Form>
  );
}
