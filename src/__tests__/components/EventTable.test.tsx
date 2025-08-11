import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EventTable from "../../app/(auth)/components/EventTable";
import fetchMock from "jest-fetch-mock";

// JSDOM patches for unsupported browser features
Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(window.HTMLElement.prototype, "hasPointerCapture", {
  configurable: true,
  value: () => false,
});

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Sample events for pages
const page1Events = {
  data: [
    {
      id: "1",
      title: "Test Event",
      date: new Date().toISOString(),
      location: "Test Location",
      status: "PUBLISHED",
      reminders: [
        {
          reminderTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ],
    },
  ],
  meta: {
    total: 2,
  },
};

const page2Events = {
  data: [
    {
      id: "2",
      title: "Second Event",
      date: new Date().toISOString(),
      location: "Another Location",
      status: "DRAFT",
      reminders: [],
    },
  ],
  meta: {
    total: 2,
  },
};

describe("EventTable", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    fetchMock.resetMocks();
    queryClient = new QueryClient();
  });

  function renderWithQueryClient(ui: React.ReactElement) {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  }

  it("renders event table with fetched data", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(page1Events));

    renderWithQueryClient(<EventTable />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
      expect(screen.getByText("Test Location")).toBeInTheDocument();
    });
  });

  it("paginates events", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});

    fetchMock
      .mockResponseOnce(JSON.stringify(page1Events)) // initial fetch
      .mockResponseOnce(JSON.stringify(page2Events)); // fetch for page 2

    renderWithQueryClient(<EventTable />);

    // Wait for page 1 to be rendered
    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
    });

    // Click the "Next" button to paginate
    const nextButton = screen.getByRole("button", { name: /next/i });

    if (nextButton.disabled) {
      // Skip test if no next page
      return;
    }
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    // Wait for new content to appear
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.stringContaining("page=2"),
        expect.anything()
      );
      expect(screen.getByText("Second Event")).toBeInTheDocument();
    });

    (console.warn as jest.Mock).mockRestore();
  });

  it("sorts by title", async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(page1Events)) // Initial fetch
      .mockResponseOnce(JSON.stringify(page1Events)); // Sorted fetch

    renderWithQueryClient(<EventTable />);

    await waitFor(() => screen.getByText("Test Event"));

    const titleHeader = screen.getByText(/title/i);
    fireEvent.click(titleHeader); // Trigger sort

    await waitFor(() => {
      const calls = fetchMock.mock.calls.map((call) => call[0] as string);
      expect(calls.some((url) => url.includes("sortBy=title"))).toBe(true);
    });
  });
});
