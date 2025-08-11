import { render, waitFor, cleanup } from "@testing-library/react";
import SessionMonitor from "../../components/sessionMonitor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import fetchMock from "jest-fetch-mock";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.useFakeTimers();

describe("SessionMonitor", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    fetchMock.resetMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
    const banner = document.getElementById("session-expired-banner");
    if (banner) banner.remove();
  });

  function renderWithQueryClient(ui: React.ReactElement) {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  }

  it("does not fetch if pathname does not include dashboard", () => {
    (usePathname as jest.Mock).mockReturnValue("/other-page");

    renderWithQueryClient(<SessionMonitor />);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches session status if pathname includes dashboard", async () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    fetchMock.mockResponseOnce(JSON.stringify({ valid: true }));

    renderWithQueryClient(<SessionMonitor />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/session-status");
    });
  });

  it("shows banner if session expired (fetch error)", async () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    fetchMock.mockResponseOnce("", { status: 401 });

    renderWithQueryClient(<SessionMonitor />);

    await waitFor(() => {
      const banner = document.getElementById("session-expired-banner");
      expect(banner).toBeInTheDocument();
      expect(banner?.textContent).toContain("Your session has expired");
    });
  });

  it("removes banner on unmount", async () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    fetchMock.mockResponseOnce("", { status: 401 });

    const { unmount } = renderWithQueryClient(<SessionMonitor />);

    await waitFor(() => {
      expect(
        document.getElementById("session-expired-banner")
      ).toBeInTheDocument();
    });

    unmount();

    expect(
      document.getElementById("session-expired-banner")
    ).not.toBeInTheDocument();
  });
});
