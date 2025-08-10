"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreVertical, Eye, Edit2, Trash2 } from "lucide-react";
import { deleteEvent } from "@/app/actions/event/delete";
import { useQuery } from "@tanstack/react-query";
import { useInvalidateEvents } from "@/hooks/useInvalidateEvents";
import { getReminderKeyFromTimes } from "@/lib/utils";
import { keepPreviousData } from "@tanstack/react-query";
import { EventListResponse, Event, Reminder } from "../types/eventTable";
import { ROUTES, QUERY_TIMES } from "@/constants/routes";

// --- ActionsDropdown ---
function ActionsDropdown({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Actions"
      >
        <MoreVertical />
      </Button>
      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-36 rounded-md border bg-white shadow-md z-10"
        >
          <button
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye size={16} /> View
          </button>
          <button
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Edit2 size={16} /> Edit
          </button>
          <button
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 w-full text-left text-red-600 hover:bg-red-100"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// --- EventTable ---
export default function EventTable() {
  const router = useRouter();
  const invalidateEvents = useInvalidateEvents();

  // local UI state
  const [data, setData] = useState<Event[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "DRAFT" | "PUBLISHED" | "CANCELED"
  >("all");
  const [reminderFilter, setReminderFilter] = useState<
    "all" | "true" | "false"
  >("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  // debounce search term
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // columns
  const columns = useMemo<ColumnDef<Event>[]>(
    () => [
      {
        accessorKey: "title",
        header: () => <span>Title</span>,
        enableSorting: true,
      },
      {
        accessorKey: "date",
        header: () => <span>Date</span>,
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
        enableSorting: true,
      },
      {
        accessorKey: "location",
        header: () => <span>Location</span>,
      },
      {
        accessorKey: "status",
        header: () => <span>Status</span>,
        cell: (info) => {
          const status = info.getValue() as Event["status"];
          const variant: "default" | "secondary" | "destructive" =
            status === "DRAFT"
              ? "secondary"
              : status === "CANCELED"
              ? "destructive"
              : "default";
          return <Badge variant={variant}>{status}</Badge>;
        },
        enableSorting: true,
      },
      {
        id: "reminder",
        header: () => <span>Reminder</span>,
        cell: (info) => {
          const e = info.row.original;
          const reminders = e.reminders || [];
          const eventDate = new Date(e.date);
          if (reminders.length === 0 || reminders[0].reminderTime === "none") {
            return <span className="text-muted-foreground">No reminder</span>;
          }
          const reminderDate = new Date(reminders[0].reminderTime);
          const diffMs = eventDate.getTime() - reminderDate.getTime();
          const minutesBefore = Math.max(0, Math.floor(diffMs / (1000 * 60)));
          const label = getReminderKeyFromTimes(
            e.date,
            reminderDate.toISOString()
          );
          if (label === "none")
            return <span className="text-muted-foreground">No reminder</span>;
          const maxMinutes = 10080; // 7 days
          const widthPercent = Math.min(
            (minutesBefore / maxMinutes) * 100,
            100
          );
          return (
            <div className="space-y-1">
              <Badge variant="outline">{label} before</Badge>
              <div className="w-full bg-gray-200 h-1 rounded">
                <div
                  className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const event = row.original;
          return (
            <ActionsDropdown
              onView={() => router.push(ROUTES.EVENT_VIEW(event.id))}
              onEdit={() => router.push(ROUTES.EVENT_EDIT(event.id))}
              onDelete={() => handleDelete(event.id)}
            />
          );
        },
      },
    ],
    [router]
  );

  // react-query fetching
  const queryKey = [
    "events",
    pageIndex,
    sorting,
    statusFilter,
    reminderFilter,
    startDateFilter,
    endDateFilter,
    debouncedSearchTerm,
  ];

  const {
    data: eventData,
    isFetching,
    isError,
  } = useQuery<EventListResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", (pageIndex + 1).toString());
      params.append("limit", pageSize.toString());
      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
      }
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (reminderFilter !== "all") params.append("reminder", reminderFilter);
      if (startDateFilter) params.append("startDate", startDateFilter);
      if (endDateFilter) params.append("endDate", endDateFilter);
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    staleTime:
      pageIndex === 0
        ? QUERY_TIMES.FIRST_PAGE_STALE_TIME
        : QUERY_TIMES.DEFAULT_STALE_TIME,
    gcTime:
      pageIndex === 0
        ? QUERY_TIMES.FIRST_PAGE_GC_TIME
        : QUERY_TIMES.DEFAULT_GC_TIME,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (eventData) {
      setData(eventData.data);
      setTotalRows(eventData.meta.total);
    }
  }, [eventData]);

  const handleDelete = (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    startTransition(async () => {
      const res = await deleteEvent(eventId);
      if (res.success) {
        invalidateEvents();
        router.push("/dashboard/events");
      } else {
        // show toast in real app
        console.error(res.message || "Failed to delete event");
      }
    });
  };

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (statusFilter !== "all") c++;
    if (reminderFilter !== "all") c++;
    if (startDateFilter) c++;
    if (endDateFilter) c++;
    if (searchTerm) c++;
    return c;
  }, [
    statusFilter,
    reminderFilter,
    startDateFilter,
    endDateFilter,
    searchTerm,
  ]);

  // table
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.max(1, Math.ceil(totalRows / pageSize)),
    state: { pagination: { pageIndex, pageSize }, sorting },
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        setPageIndex((old) => {
          const newState = updater({ pageIndex: old, pageSize });
          return newState.pageIndex;
        });
      } else {
        setPageIndex(updater.pageIndex);
      }
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isError) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Failed to load events. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-lg p-6 shadow-lg text-white">
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-md select-none">
          🎉 Event Management Dashboard
        </h1>
        <p className="mt-1 text-pink-100 font-medium max-w-lg">
          Manage your events efficiently with filtering, sorting, and easy
          actions.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageIndex(0);
            }}
            type="search"
            aria-label="Search events"
            className="pr-10"
          />
        </div>
        <Button
          onClick={() => router.push("/dashboard/events/create")}
          className="whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-pink-500 to-purple-600 text-white"
        >
          + Create New Event
        </Button>
      </div>

      <div className="flex flex-wrap gap-6 items-end border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
        <div>
          <label
            htmlFor="status"
            className="block mb-1 font-semibold text-gray-700 text-sm"
          >
            Status
          </label>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val as any);
              setPageIndex(0);
            }}
          >
            <SelectTrigger id="status" className="w-44">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="reminder"
            className="block mb-1 font-semibold text-gray-700 text-sm"
          >
            Reminder
          </label>
          <Select
            value={reminderFilter}
            onValueChange={(val) => {
              setReminderFilter(val as any);
              setPageIndex(0);
            }}
          >
            <SelectTrigger id="reminder" className="w-44">
              <SelectValue placeholder="Select Reminder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">With Reminder</SelectItem>
              <SelectItem value="false">Without Reminder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="block mb-1 font-semibold text-gray-700 text-sm"
          >
            Start Date
          </label>
          <Input
            id="startDate"
            type="date"
            value={startDateFilter}
            onChange={(e) => {
              setStartDateFilter(e.target.value);
              setPageIndex(0);
            }}
            className="w-36"
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="block mb-1 font-semibold text-gray-700 text-sm"
          >
            End Date
          </label>
          <Input
            id="endDate"
            type="date"
            value={endDateFilter}
            onChange={(e) => {
              setEndDateFilter(e.target.value);
              setPageIndex(0);
            }}
            className="w-36"
          />
        </div>

        <div className="relative ml-auto">
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("all");
              setReminderFilter("all");
              setStartDateFilter("");
              setEndDateFilter("");
              setSearchTerm("");
              setPageIndex(0);
            }}
            className="relative cursor-pointer"
          >
            Reset Filters
          </Button>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gradient-to-r from-purple-50 to-pink-50 sticky top-0 z-20"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={`cursor-pointer select-none py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide ${
                        canSort ? "hover:text-purple-600" : ""
                      }`}
                      onClick={
                        canSort
                          ? () => header.column.toggleSorting()
                          : undefined
                      }
                      scope="col"
                      style={{ userSelect: "none", whiteSpace: "nowrap" }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <ArrowUpDown
                            className="inline-block text-gray-400"
                            size={16}
                            aria-hidden="true"
                          />
                        )}
                        {sortDirection === "asc" ? (
                          <span className="text-purple-600 ml-1">▲</span>
                        ) : sortDirection === "desc" ? (
                          <span className="text-purple-600 ml-1">▼</span>
                        ) : null}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isFetching && data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-500 italic"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-500 italic"
                >
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="even:bg-white odd:bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-3 px-4 whitespace-nowrap text-gray-800"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="shadow-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="shadow-sm"
          >
            Next
          </Button>
        </div>
        <div className="select-none">
          Page{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>{" "}
          | Total events: <strong>{totalRows}</strong>
        </div>
      </div>
    </div>
  );
}
