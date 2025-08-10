"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input, Label, Button } from "@/components/ui";
import { ROUTES } from "@/constants/routes";

export default function LoginForm() {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";

  const [email, setEmail] = useState(isDev ? "user1@example.com" : "");
  const [password, setPassword] = useState(isDev ? "hashedpassword1" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic client-side validation
    if (!email.includes("@") || password.length < 4) {
      setError("Please enter a valid email and password.");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Invalid email or password.");
    } else {
      router.push(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white/20 backdrop-blur-lg p-8 shadow-2xl border border-white/30 text-white"
        noValidate
      >
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back 👋</h1>
        <p className="text-sm text-center text-purple-100 mb-4">
          Please login to manage your events
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            className="bg-white/30 text-white placeholder:text-white/70"
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            required
            aria-describedby={error ? "error-message" : undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            className="bg-white/30 text-white placeholder:text-white/70"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            required
            aria-describedby={error ? "error-message" : undefined}
          />
        </div>

        {error && (
          <p
            id="error-message"
            className="text-sm text-red-100 bg-red-600/30 rounded-md px-3 py-2"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full mt-2 cursor-pointer bg-yellow-300 hover:bg-yellow-400 text-purple-900 font-bold"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
