"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function SessionMonitor() {
  const pathname = usePathname();
  const shouldCheck = pathname.includes("dashboard");

  const { error } = useQuery({
    queryKey: ["session-status"],
    queryFn: async () => {
      const res = await fetch("/api/session-status");
      if (!res.ok) throw new Error("Session expired");
      return res.json();
    },
    enabled: shouldCheck,
    refetchInterval: 10000, // poll every 10s
    retry: false,
    staleTime: 0,
  });

  // Show banner via effect
  useEffect(() => {
    if (error && typeof window !== "undefined") {
      if (!document.getElementById("session-expired-banner")) {
        const div = document.createElement("div");
        div.id = "session-expired-banner";
        div.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f44336;
            color: white;
            padding: 16px;
            font-size: 16px;
            z-index: 9999;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: sans-serif;
          ">
            <span>Your session has expired. Please </span>
            <a href="/login" style="
              margin-left: 8px;
              background: white;
              color: #f44336;
              padding: 6px 12px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: bold;
            ">Login</a>
          </div>
        `;
        document.body.appendChild(div);
      }
    }
  }, [error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const banner = document.getElementById("session-expired-banner");
      if (banner) banner.remove();
    };
  }, []);

  return null;
}
